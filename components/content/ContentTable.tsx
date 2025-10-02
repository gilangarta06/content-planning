'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Project, Content } from '@/lib/types';
import { Plus, Search, Download, Trash2, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface ContentTableProps {
  project: Project;
  onContentUpdated: () => void;
}

export function ContentTable({ project, onContentUpdated }: ContentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const filteredContents = project.contents.filter(content => {
    const matchesSearch = content.copy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || content.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Tambah konten baru (API call)
  const addNewContent = async () => {
    const newContent: Omit<Content, 'id'> = {
      publishDate: new Date(),
      contentType: 'Post',
      copy: '',
      status: 'Draft',
      linkToAsset: '',
      linkToPublishedPost: ''
    };

    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addContent', content: newContent })
    });

    onContentUpdated();
  };

  // ✅ Update konten
  const updateContent = async (contentId: string, updates: Partial<Content>) => {
    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateContent', contentId, updates })
    });

    onContentUpdated();
    setEditingCell(null);
  };

  // ✅ Hapus konten
  const deleteContent = async (contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteContent', contentId })
      });

      onContentUpdated();
    }
  };

  // ✅ Export ke CSV
  const exportToCSV = () => {
    const headers = ['Publish Date', 'Content Type', 'Copy', 'Status', 'Link to Asset', 'Link to Published Post'];
    const csvContent = [
      headers.join(','),
      ...filteredContents.map(content => [
        format(content.publishDate, 'yyyy-MM-dd'),
        content.contentType,
        `"${content.copy.replace(/"/g, '""')}"`,
        content.status,
        content.linkToAsset || '',
        content.linkToPublishedPost || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}-content-plan.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ✅ Warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ Cell yang bisa diedit
  const EditableCell = ({ 
    content, 
    field, 
    type = 'text',
    options 
  }: { 
    content: Content; 
    field: keyof Content; 
    type?: 'text' | 'select' | 'date';
    options?: string[];
  }) => {
    const cellId = `${content.id}-${field}`;
    const isEditing = editingCell === cellId;
    const value = content[field];

    if (type === 'date' && field === 'publishDate') {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto justify-start font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(content.publishDate, 'MMM dd, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={content.publishDate}
              onSelect={(date) => {
                if (date) {
                  updateContent(content.id, { publishDate: date });
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );
    }

    if (type === 'select' && options) {
      return (
        <Select
          value={value as string}
          onValueChange={(newValue) => updateContent(content.id, { [field]: newValue })}
        >
          <SelectTrigger className="border-none h-auto p-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (isEditing) {
      return (
        <Input
          value={value as string}
          onChange={(e) => updateContent(content.id, { [field]: e.target.value })}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setEditingCell(null);
          }}
          autoFocus
          className="border-none p-0 h-auto bg-transparent"
        />
      );
    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded min-h-[20px]"
        onClick={() => setEditingCell(cellId)}
      >
        {value as string || <span className="text-muted-foreground">Click to edit</span>}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{project.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={addNewContent} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>
        </div>
        
        {project.description && (
          <p className="text-sm text-muted-foreground">{project.description}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publish Date</TableHead>
                <TableHead>Content Type</TableHead>
                <TableHead className="max-w-xs">Copy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Asset Link</TableHead>
                <TableHead>Published Link</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== 'All' 
                      ? 'No content matches your filters' 
                      : 'No content yet. Click "Add Content" to get started.'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredContents
                  .sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime())
                  .map(content => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <EditableCell content={content} field="publishDate" type="date" />
                      </TableCell>
                      <TableCell>
                        <EditableCell 
                          content={content} 
                          field="contentType" 
                          type="select"
                          options={['Post', 'Story', 'Reel', 'Video', 'Other']}
                        />
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">
                          <EditableCell content={content} field="copy" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(content.status)}>
                          <EditableCell 
                            content={content} 
                            field="status" 
                            type="select"
                            options={['Draft', 'In Progress', 'Scheduled', 'Published']}
                          />
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EditableCell content={content} field="linkToAsset" />
                          {content.linkToAsset && (
                            <a 
                              href={content.linkToAsset} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EditableCell content={content} field="linkToPublishedPost" />
                          {content.linkToPublishedPost && (
                            <a 
                              href={content.linkToPublishedPost} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteContent(content.id)}
                          className="text-muted-foreground hover:text-destructive p-1 h-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
