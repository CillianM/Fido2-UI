import { Component, OnInit } from '@angular/core';
import { Base64 } from '../services/base64';
import { AssertionService } from '../services/assertion';
import { AlertService } from '../services/alert.service';
import { WindowRef } from '../services/window';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  domain: String;
  window;
  loginForm: FormGroup

  constructor(
    private base64: Base64,
    private assertionService: AssertionService,
    private alertService: AlertService,
    private windowRef: WindowRef,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.window = this.windowRef.nativeWindow;
    this.domain = document.domain;
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      displayName: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    console.log(this.f.username.value)
    this.beginLogin(this.f.username.value)
  }

  beginLogin(username: String) {
    this.assertionService.beginLogin(username, "nonce.corp.mastercard.org")
      .pipe()
      .subscribe(
        data => {
          console.info("Updated Response from FIDO RP server ", data)
          var resp = this.preformatGetAssertReq(data)
          console.info("Updated Response from FIDO RP server ", resp)
          console.log(resp.allowCredentials[0].id)
          const credentialPromise = new Promise((resolve, reject) => {
            resolve(this.window.navigator.credentials.get({ publicKey: resp }));
          }).then(
            (aAssertion) => {
              console.log(aAssertion)
              var resp = this.publicKeyCredentialToJSON(aAssertion);
              console.info("Get Assertion Response " + data);
              this.assertionService.returnResult(resp).pipe()
                .subscribe(
                  data => {
                    this.alertService.success("Successful match [" + data.status + "]")
                  },
                  error => {
                    this.alertService.error("Failure [" + error.error.status + "-" + error.error.errorMessage + "]");
                  }
                );
            },
            (error) => { 
              console.log(error)
              this.alertService.error(error) }
          );

        },
        error => {
          console.log(error)
          this.alertService.error(error.error.errorMessage);
        });

  }

  preformatGetAssertReq = (getAssert) => {
    getAssert.challenge = this.base64.decode(getAssert.challenge);
    for (let allowCred of getAssert.allowCredentials) {
      allowCred.id = this.base64.decode(allowCred.id);
    }
    return getAssert
  }

  publicKeyCredentialToJSON = (pubKeyCred) => {
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
      pubKeyCred["domain"] = this.window.domain;

      for (let key in pubKeyCred) {
        console.log(key)
        obj[key] = this.publicKeyCredentialToJSON(pubKeyCred[key])
      }

      return obj
    }

    return pubKeyCred
  }

}
