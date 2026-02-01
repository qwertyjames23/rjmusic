"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value
}) => {
    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    };

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
                        <div className="z-10 absolute top-2 right-2">
                            <button
                                type="button"
                                onClick={() => onRemove(url)}
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="Image"
                            src={url}
                        />
                    </div>
                ))}
            </div>
            <CldUploadWidget
                uploadPreset="rjmusic_preset" // We will need to set this up in Cloudinary
                onSuccess={onUpload}
                options={{
                    maxFiles: 1
                }}
            >
                {({ open }) => {
                    return (
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => open()}
                            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition"
                        >
                            <ImagePlus className="w-4 h-4" />
                            Upload an Image
                        </button>
                    )
                }}
            </CldUploadWidget>
        </div>
    );
}

export default ImageUpload;
