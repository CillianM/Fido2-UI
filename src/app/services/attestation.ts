import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable()
export class AttestationService {
    constructor(private http: HttpClient) { }

    beginRegistration(username: String,displayName: String) {
        return this.http.post<any>(`${environment.apiUrl}/attestation/options/`, {"username":username,"displayName":displayName});
    }

    returnResult(response){
        return this.http.post<any>(`${environment.apiUrl}/attestation/result/`, response);
    }
}