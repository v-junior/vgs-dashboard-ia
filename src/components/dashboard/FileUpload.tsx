import { useState, useCallback } from 'react';
import { Upload, FileJson, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileLoad: (data: unknown[]) => void;
}

type UploadStatus = 'idle' | 'success' | 'error';

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState<string>('');

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json')) {
      setStatus('error');
      setFileName('Arquivo deve ser JSON');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!Array.isArray(data)) {
          throw new Error('JSON deve ser uma lista de widgets');
        }
        
        setStatus('success');
        setFileName(file.name);
        onFileLoad(data);
      } catch (error) {
        setStatus('error');
        setFileName('Erro ao processar JSON');
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFile(file);
      }
    };
    input.click();
  }, [handleFile]);

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative cursor-pointer rounded-lg border-2 border-dashed p-8 transition-all duration-200',
        'flex flex-col items-center justify-center gap-3',
        'hover:border-primary hover:bg-primary/5',
        isDragging && 'border-primary bg-primary/10 scale-[1.02]',
        status === 'success' && 'border-success bg-success/5',
        status === 'error' && 'border-destructive bg-destructive/5',
        status === 'idle' && 'border-border bg-card'
      )}
    >
      <div className={cn(
        'rounded-full p-4 transition-colors',
        status === 'success' && 'bg-success/10 text-success',
        status === 'error' && 'bg-destructive/10 text-destructive',
        status === 'idle' && 'bg-primary/10 text-primary'
      )}>
        {status === 'success' ? (
          <CheckCircle className="h-8 w-8" />
        ) : status === 'error' ? (
          <AlertCircle className="h-8 w-8" />
        ) : isDragging ? (
          <FileJson className="h-8 w-8" />
        ) : (
          <Upload className="h-8 w-8" />
        )}
      </div>
      
      <div className="text-center">
        {status === 'success' ? (
          <>
            <p className="font-medium text-success">Arquivo carregado!</p>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </>
        ) : status === 'error' ? (
          <>
            <p className="font-medium text-destructive">Erro no upload</p>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </>
        ) : (
          <>
            <p className="font-medium text-foreground">
              {isDragging ? 'Solte o arquivo aqui' : 'Arraste um arquivo JSON'}
            </p>
            <p className="text-sm text-muted-foreground">
              ou clique para selecionar
            </p>
          </>
        )}
      </div>
    </div>
  );
}
