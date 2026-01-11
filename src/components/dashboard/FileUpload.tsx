import { useState, useCallback } from 'react';
import { Upload, FileJson, CheckCircle, AlertCircle, Files } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileLoad: (data: unknown[]) => void;
}

type UploadStatus = 'idle' | 'success' | 'error';

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState<string>('');

  // Processa múltiplos arquivos
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const jsonFiles = Array.from(files).filter(f => f.name.endsWith('.json'));

    if (jsonFiles.length === 0) {
      setStatus('error');
      setMessage('Nenhum arquivo JSON válido encontrado');
      return;
    }

    try {
      const filePromises = jsonFiles.map(file => {
        return new Promise<any>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              const json = JSON.parse(content);
              resolve(json);
            } catch (err) {
              console.warn(`Erro ao ler ${file.name}`, err);
              resolve(null); // Resolve como null para não quebrar os outros
            }
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
      });

      const results = await Promise.all(filePromises);
      // Remove falhas (null)
      const validData = results.filter(item => item !== null);

      if (validData.length === 0) {
        throw new Error('Falha ao processar arquivos');
      }

      setStatus('success');
      setMessage(`${validData.length} arquivo(s) processado(s)`);
      onFileLoad(validData);

    } catch (error) {
      setStatus('error');
      setMessage('Erro ao processar arquivos');
      console.error(error);
    }
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
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true; // Permite selecionar vários na janela
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files?.length) {
        processFiles(files);
      }
    };
    input.click();
  }, [processFiles]);

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
          <Files className="h-8 w-8" />
        ) : (
          <Upload className="h-8 w-8" />
        )}
      </div>
      
      <div className="text-center">
        {status === 'success' ? (
          <>
            <p className="font-medium text-success">Sucesso!</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        ) : status === 'error' ? (
          <>
            <p className="font-medium text-destructive">Erro</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        ) : (
          <>
            <p className="font-medium text-foreground">
              {isDragging ? 'Solte os arquivos aqui' : 'Arraste múltiplos arquivos JSON'}
            </p>
            <p className="text-sm text-muted-foreground">
              ou clique para selecionar (Ctrl+Click)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
