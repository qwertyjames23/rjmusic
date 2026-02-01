
// Helper for Cloudinary Image construction if needed
// For now, we mainly use direct URLs
export const getCloudinaryUrl = (publicId: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return publicId; // Fallback or assume full URL
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};
