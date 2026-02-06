"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Trash, Upload, Star } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
    maxImages?: number; // Added limit prop
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value,
    maxImages = 5
}) => {
    const onUpload = (result: any) => {
        console.log('Upload result:', result);
        if (result?.info?.secure_url) {
            onChange(result.info.secure_url);
        }
    };

    const onError = (error: any) => {
        console.error('Upload error:', error);
        alert('Failed to upload image. Please check your Cloudinary configuration.');
    };

    const isLimitReached = value.length >= maxImages;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">
                    {value.length} / {maxImages} images uploaded
                </span>
                {isLimitReached && (
                    <span className="text-xs text-orange-500 font-bold">Limit reached</span>
                )}
            </div>

            {/* Image Preview Grid */}
            {value.length > 0 && (
                <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {value.map((url, index) => (
                        <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#1c222b] group">
                            <Image
                                fill
                                className="object-cover"
                                alt="Product image"
                                src={url}
                                sizes="200px"
                            />

                            {/* Tags */}
                            <div className="absolute top-2 left-2 z-10">
                                {index === 0 ? (
                                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <Star className="size-3 fill-current" /> Main
                                    </span>
                                ) : (
                                    <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                        #{index + 1}
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => onRemove(url)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg z-20"
                                title="Remove image"
                            >
                                <Trash className="size-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {!isLimitReached && (
                <CldUploadWidget
                    uploadPreset="rjmusic_preset"
                    onSuccess={onUpload}
                    onError={onError}
                    options={{
                        maxFiles: 1, // Keep 1 at a time for simplicity with current architecture
                        sources: ['local', 'url', 'camera'],
                        multiple: false,
                        resourceType: 'image'
                    }}
                >
                    {({ open }) => {
                        return (
                            <button
                                type="button"
                                disabled={disabled || isLimitReached}
                                onClick={() => {
                                    if (!isLimitReached) {
                                        open();
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-3 bg-[#1c222b] border-2 border-dashed border-white/20 hover:border-primary/50 text-gray-300 hover:text-white px-6 py-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <Upload className="size-6 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">
                                            {value.length === 0 ? "Upload Main Image" : "Add More Images"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {maxImages - value.length} remaining • PNG, JPG up to 10MB
                                        </p>
                                    </div>
                                </div>
                            </button>
                        )
                    }}
                </CldUploadWidget>
            )}

            {/* Info Message */}
            {value.length === 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                    💡 The first image will be used as the <strong>Main Product Image</strong>.
                </p>
            )}
        </div>
    );
}

export default ImageUpload;
