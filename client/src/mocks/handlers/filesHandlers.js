import { http, HttpResponse, delay } from 'msw';
import { files as initialFiles } from '../data/files';

// In-memory storage for files
let files = [...initialFiles];

export const filesHandlers = [
  // Get all files
  http.get('/api/files', async ({ request }) => {
    await delay(400);
    
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const subject = url.searchParams.get('subject');
    
    let filtered = files;
    
    if (category) {
      filtered = filtered.filter(f => f.category === category);
    }
    
    if (subject) {
      filtered = filtered.filter(f => f.subject === subject);
    }
    
    return HttpResponse.json({
      success: true,
      data: filtered,
    });
  }),
  
  // Get single file
  http.get('/api/files/:id', async ({ params }) => {
    await delay(300);
    
    const file = files.find(f => f.id === parseInt(params.id));
    
    if (file) {
      return HttpResponse.json({
        success: true,
        data: file,
      });
    }
    
    return HttpResponse.json(
      { success: false, message: 'File not found' },
      { status: 404 }
    );
  }),
  
  // Upload file
  http.post('/api/files/upload', async ({ request }) => {
    await delay(1000); // Simulate longer upload time
    
    const formData = await request.formData();
    const file = formData.get('file');
    const category = formData.get('category');
    const subject = formData.get('subject');
    const description = formData.get('description');
    
    const id = Math.max(...files.map(f => f.id)) + 1;
    
    const newFile = {
      id,
      name: file?.name || 'unknown.pdf',
      type: file?.name?.split('.').pop() || 'pdf',
      category,
      subject,
      description,
      size: Math.floor(Math.random() * 5000) + 100,
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString(),
      class: 'Class 10',
      downloads: 0,
      url: '#',
    };
    
    files.unshift(newFile);
    
    return HttpResponse.json({
      success: true,
      data: newFile,
      message: 'File uploaded successfully',
    });
  }),
  
  // Delete file
  http.delete('/api/files/:id', async ({ params }) => {
    await delay(400);
    
    const index = files.findIndex(f => f.id === parseInt(params.id));
    
    if (index !== -1) {
      files.splice(index, 1);
      
      return HttpResponse.json({
        success: true,
        message: 'File deleted successfully',
      });
    }
    
    return HttpResponse.json(
      { success: false, message: 'File not found' },
      { status: 404 }
    );
  }),
  
  // Increment download count
  http.post('/api/files/:id/download', async ({ params }) => {
    await delay(200);
    
    const index = files.findIndex(f => f.id === parseInt(params.id));
    
    if (index !== -1) {
      files[index].downloads += 1;
      
      return HttpResponse.json({
        success: true,
        message: 'Download counted',
      });
    }
    
    return HttpResponse.json(
      { success: false, message: 'File not found' },
      { status: 404 }
    );
  }),
];
