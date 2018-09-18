import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable()
export class AttestationService {
    constructor(private http: HttpClient) { }

    beginRegistration(username: String,displayName: String, domain: String) {
        return this.http.post<any>(`${environment.apiUrl}/attestation/options/`, {"username":username,"displayName":displayName, "domain":domain});
    }

    returnResult(response){
        return this.http.post<any>(`${environment.apiUrl}/attestation/result/`, response);
    }
}