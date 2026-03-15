import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ImageDropZone } from './ImageDropZone'

describe('ImageDropZone', () => {
  it('renders upload prompt when no previews exist', () => {
    render(<ImageDropZone onFilesSelected={vi.fn()} />)
    expect(screen.getByText(/drop.*image.*here|upload/i)).toBeInTheDocument()
  })

  it('renders custom label text', () => {
    render(
      <ImageDropZone onFilesSelected={vi.fn()} label="Drop hero image here" />,
    )
    expect(screen.getByText('Drop hero image here')).toBeInTheDocument()
  })

  it('calls onFilesSelected when file is selected via input', () => {
    const onFilesSelected = vi.fn()
    render(<ImageDropZone onFilesSelected={onFilesSelected} />)

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    expect(input).toBeTruthy()

    const file = new File(['pixels'], 'photo.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(onFilesSelected).toHaveBeenCalledWith([file])
  })

  it('passes single file when multiple is false (default)', () => {
    const onFilesSelected = vi.fn()
    render(<ImageDropZone onFilesSelected={onFilesSelected} />)

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    const file1 = new File(['a'], 'a.png', { type: 'image/png' })
    const file2 = new File(['b'], 'b.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file1, file2] } })

    // When not multiple, only the first file should be passed
    expect(onFilesSelected).toHaveBeenCalledWith([file1])
  })

  it('passes all files when multiple is true', () => {
    const onFilesSelected = vi.fn()
    render(<ImageDropZone onFilesSelected={onFilesSelected} multiple />)

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    const file1 = new File(['a'], 'a.png', { type: 'image/png' })
    const file2 = new File(['b'], 'b.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file1, file2] } })

    expect(onFilesSelected).toHaveBeenCalledWith([file1, file2])
  })

  it('shows preview thumbnails for provided preview URLs', () => {
    render(
      <ImageDropZone
        onFilesSelected={vi.fn()}
        previews={['https://example.com/img1.jpg', 'https://example.com/img2.jpg']}
      />,
    )

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', 'https://example.com/img1.jpg')
    expect(images[1]).toHaveAttribute('src', 'https://example.com/img2.jpg')
  })

  it('applies drag-over visual feedback', () => {
    render(<ImageDropZone onFilesSelected={vi.fn()} data-testid="dropzone" />)

    const dropzone = screen.getByTestId('dropzone')

    fireEvent.dragOver(dropzone, { dataTransfer: { types: ['Files'] } })
    expect(dropzone.className).toContain('border-accent bg-accent/10')

    fireEvent.dragLeave(dropzone)
    expect(dropzone.className).toContain('border-white/20')
    expect(dropzone.className).not.toContain('bg-accent/10')
  })
})
