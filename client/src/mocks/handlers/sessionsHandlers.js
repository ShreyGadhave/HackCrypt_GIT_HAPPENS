import { http, HttpResponse, delay } from 'msw';
import { sessions as initialSessions } from '../data/sessions';

// In-memory storage for sessions
let sessions = [...initialSessions];

export const sessionsHandlers = [
  // Get all sessions
  http.get('/api/sessions', async ({ request }) => {
    await delay(400);
    
    const url = new URL(request.url);
    const classParam = url.searchParams.get('class');
    const subject = url.searchParams.get('subject');
    const status = url.searchParams.get('status');
    
    let filtered = sessions;
    
    if (classParam) {
      filtered = filtered.filter(s => s.class === classParam);
    }
    
    if (subject) {
      filtered = filtered.filter(s => s.subject === subject);
    }
    
    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }
    
    return HttpResponse.json({
      success: true,
      data: filtered,
    });
  }),
  
  // Get single session
  http.get('/api/sessions/:id', async ({ params }) => {
    await delay(300);
    
    const session = sessions.find(s => s.id === parseInt(params.id));
    
    if (session) {
      return HttpResponse.json({
        success: true,
        data: session,
      });
    }
    
    return HttpResponse.json(
      { success: false, message: 'Session not found' },
      { status: 404 }
    );
  }),
  
  // Create session
  http.post('/api/sessions', async ({ request }) => {
    await delay(500);
    
    const newSession = await request.json();
    const id = Math.max(...sessions.map(s => s.id)) + 1;
    
    const session = {
      ...newSession,
      id,
      createdAt: new Date().toISOString(),
      status: 'upcoming',
    };
    
    sessions.unshift(session);
    
    return HttpResponse.json({
      success: true,
      data: session,
      message: 'Session created successfully',
    });
  }),
  
  // Update session
  http.put('/api/sessions/:id', async ({ params, request }) => {
    await delay(500);
    
    const updates = await request.json();
    const index = sessions.findIndex(s => s.id === parseInt(params.id));
    
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      
      return HttpResponse.json({
        success: true,
        data: sessions[index],
        message: 'Session updated successfully',
      });
    }
    
    return HttpResponse.json(
      { success: false, message: 'Session not found' },
      { status: 404 }
    );
  }),
  
  // Delete session
  http.delete('/api/sessions/:id', async ({ params }) => {
    await delay(400);
    
    const index = sessions.findIndex(s => s.id === parseInt(params.id));
    
    if (index !== -1) {
      sessions.splice(index, 1);
      
      return HttpResponse.json({
        success: true,
        message: 'Session deleted successfully',
      });
    }
    
    return HttpResponse.json(
      { success: false, message: 'Session not found' },
      { status: 404 }
    );
  }),
];
