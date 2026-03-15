import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'

interface ImageDropZoneProps {
  onFilesSelected: (files: File[]) => void
  previews?: string[]
  multiple?: boolean
  label?: string
  className?: string
  'data-testid'?: string
}

export function ImageDropZone({
  onFilesSelected,
  previews,
  multiple = false,
  label = 'Drop image here or click to upload',
  className = '',
  'data-testid': testId,
}: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const allFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith('image/'),
    )
    if (allFiles.length === 0) return
    onFilesSelected(multiple ? allFiles : [allFiles[0]])
  }

  return (
    <div
      data-testid={testId}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors ${
        isDragging
          ? 'border-accent bg-accent/10'
          : 'border-white/20 bg-white/5 hover:border-accent/50'
      } ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previews && previews.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {previews.map((url) => (
            <img
              key={url}
              src={url}
              alt="Preview"
              className="h-20 w-20 rounded-lg object-cover"
            />
          ))}
        </div>
      ) : (
        <>
          <Upload className="h-8 w-8 text-white/40" />
          <p className="text-sm text-white/60">{label}</p>
        </>
      )}
    </div>
  )
}
