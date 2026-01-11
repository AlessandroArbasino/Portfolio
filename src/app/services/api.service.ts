import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    Project,
    FixedTexts,
    Document,
    ContactItem,
    LanguageDto,
    PersonalProfile,
    ChatResponse,
    ChatHistory,
    Theme,
    ChatStatus
} from '../models/api.models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(private http: HttpClient) { }

    getProjects(lang: string = 'en', type?: string): Observable<Project[]> {
        let params = new HttpParams().set('lang', lang);
        if (type) {
            params = params.set('type', type);
        }
        return this.http.get<Project[]>(`/api/projects`, { params });
    }

    getFixedTexts(lang: string = 'en'): Observable<FixedTexts> {
        return this.http.get<FixedTexts>(`/api/fixed-texts?lang=${lang}`);
    }

    getDocuments(lang: string = 'en'): Observable<Document[]> {
        return this.http.get<Document[]>(`/api/documents?lang=${lang}`);
    }

    getContact(): Observable<ContactItem[]> {
        return this.http.get<ContactItem[]>('/api/contact');
    }

    getLanguages(): Observable<LanguageDto[]> {
        return this.http.get<LanguageDto[]>('/api/languages');
    }

    fetchProfile(lang: string = 'en'): Observable<PersonalProfile> {
        return this.http.get<PersonalProfile>(`/api/profile?lang=${lang}`);
    }

    sendMessage(message: string, lang?: string): Observable<ChatResponse> {
        const params = lang ? new HttpParams().set('lang', lang) : undefined;
        return this.http.post<ChatResponse>('/api/chat', { message }, { params });
    }

    fetchChatHistory(lang?: string): Observable<ChatHistory> {
        const url = lang ? `/api/chat?lang=${lang}` : '/api/chat';
        return this.http.get<ChatHistory>(url);
    }

    getChatStatus(lang?: string): Observable<ChatStatus> {
        const params = lang ? new HttpParams().set('lang', lang) : undefined;
        return this.http.get<ChatStatus>('/api/chat/status', { params });
    }

    saveTheme(theme: Partial<Theme>): Observable<{ message: string }> {
        return this.http.put<{ message: string }>('/api/chat/theme', { theme });
    }

    getBackgroundImages(keywords?: string, contentType?: string): Observable<string[]> {
        let params = new HttpParams();
        if (keywords) params = params.append('keywords', keywords);
        if (contentType) params = params.append('content_type', contentType);
        return this.http.get<string[]>('/api/background-images', { params });
    }
}
