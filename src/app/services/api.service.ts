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
    Theme
} from '../models/api.models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(private http: HttpClient) { }

    getProjects(lang: string = 'it'): Observable<Project[]> {
        return this.http.get<Project[]>(`/api/projects?lang=${lang}`);
    }

    getFixedTexts(lang: string = 'it'): Observable<FixedTexts> {
        return this.http.get<FixedTexts>(`/api/fixed-texts?lang=${lang}`);
    }

    getDocuments(lang: string = 'it'): Observable<Document[]> {
        return this.http.get<Document[]>(`/api/documents?lang=${lang}`);
    }

    getContact(): Observable<ContactItem[]> {
        return this.http.get<ContactItem[]>('/api/contact');
    }

    getLanguages(): Observable<LanguageDto[]> {
        return this.http.get<LanguageDto[]>('/api/languages');
    }

    fetchProfile(lang: string = 'it'): Observable<PersonalProfile> {
        return this.http.get<PersonalProfile>(`/api/profile?lang=${lang}`);
    }

    sendMessage(message: string): Observable<ChatResponse> {
        return this.http.post<ChatResponse>('/api/chat', { message });
    }

    fetchChatHistory(): Observable<ChatHistory> {
        return this.http.get<ChatHistory>('/api/chat');
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
