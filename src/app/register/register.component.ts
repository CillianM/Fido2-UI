import { Component, OnInit } from '@angular/core';
import { Base64 } from '../services/base64';
import { AttestationService } from '../services/attestation';
import { AlertService } from '../services/alert.service';
import { WindowRef } from '../services/window';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(
    private base64: Base64,
    private attestationService: AttestationService,
    private alertService: AlertService,
    private windowRef: WindowRef,
    private formBuilder: FormBuilder
  ) { }

  domain: String;
  window;
  registerForm: FormGroup

  ngOnInit() {
    this.window = this.windowRef.nativeWindow;
    this.domain = document.domain;
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      displayName: ['', Validators.required]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    console.log(this.f.username.value)
    this.beginRegistration(this.f.username.value, this.f.displayName.value)

  }

  beginRegistration(username: String, displayname: String) {
    this.attestationService.beginRegistration(username, displayname)
      .pipe()
      .subscribe(
        data => {
          console.log(data);
          let v = this.preformatMakeCredReq(data);
          console.info("Updated Response from FIDO RP server ", v)
          console.info("RP Domain = ", this.domain)
          v.rp.id = this.domain;
          const credentialPromise = new Promise((resolve, reject) => {
            resolve(this.window.navigator.credentials.create({ publicKey: v }));
          }).then(
            (aNewCredentialInfo) => {
              console.log(aNewCredentialInfo)
              var response = this.publicKeyCredentialToJSON(aNewCredentialInfo);
              console.info("response = " + response)
              console.info("response = " + JSON.stringify(response))
              this.attestationService.returnResult(response).pipe()
                .subscribe(
                  data => {
                    this.alertService.success("Successfully Registered!")
                  },
                  error => {
                    this.alertService.error(error.error.errorMessage);
                  }
                );
            },
            (error) => {this.alertService.error("Error occured")}
          );

        },
        error => {
          this.alertService.error(error.error.errorMessage);
        });

  }

  preformatMakeCredReq(makeCredReq) {
    console.info("Updating credentials ", makeCredReq)
    makeCredReq.challenge = this.base64.decode(makeCredReq.challenge);
    makeCredReq.user.id = this.base64.decode(makeCredReq.user.id);
    return makeCredReq
  }

  publicKeyCredentialToJSON(pubKeyCred) {
    if (pubKeyCred instanceof Array) {
      let arr = [];
      for (let i of pubKeyCred)
        arr.push(this.publicKeyCredentialToJSON(i));
      return arr
    }

    if (pubKeyCred instanceof ArrayBuffer) {
      return this.base64.encode(pubKeyCred)
    }
    if (pubKeyCred instanceof Object) {
      let obj = {};

      for (let key in pubKeyCred) {
        obj[key] = this.publicKeyCredentialToJSON(pubKeyCred[key])
      }

      return obj
    }

    return pubKeyCred
  }

}
