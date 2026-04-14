const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.8

export async function compressImage(file: File): Promise<File> {
  // Skip non-image files
  if (!file.type.startsWith('image/')) return file

  return new Promise<File>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        let { width, height } = img

        // Only resize if larger than max dimension
        if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
          // Still convert to JPEG for compression
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file) // fallback to original
                return
              }
              // Only use compressed if it's actually smaller
              if (blob.size >= file.size) {
                resolve(file)
                return
              }
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            },
            'image/jpeg',
            JPEG_QUALITY,
          )
          return
        }

        // Calculate new dimensions
        const ratio = Math.min(
          MAX_DIMENSION / width,
          MAX_DIMENSION / height,
        )
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          JPEG_QUALITY,
        )
      } catch {
        reject(new Error('Failed to compress image'))
      }
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage))
}
