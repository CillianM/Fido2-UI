import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, RequestMethod } from '@angular/http';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AssertionService {
    constructor(private http: HttpClient) { }

    beginLogin(username: String, domain: String) {
        return this.http.post<any>(`${environment.apiUrl}/assertion/options/`, {"username":username, "documentDomain":domain});
    }

    returnResult(response){
        return this.http.post<any>(`${environment.apiUrl}/assertion/result/`, response);
    }
}