'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Camera } from 'lucide-react';

interface ProfileImageUploadProps {
  currentImage?: string;
  name?: string;
  email: string;
  onImageUpdate: (imageUrl: string) => void;
}

export function ProfileImageUpload({ currentImage, name, email, onImageUpdate }: ProfileImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Only JPEG, PNG, GIF, and WebP images are allowed.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: 'File Too Large',
          description: 'Image size must be less than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/user/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      
      // Update the profile with the new image URL
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: data.imageUrl }),
      });

      onImageUpdate(data.imageUrl);
      setPreviewUrl(null);
      
      toast({
        title: 'Success',
        description: 'Profile image updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: '' }),
      });

      onImageUpdate('');
      
      toast({
        title: 'Success',
        description: 'Profile image removed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove profile image.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Image
        </CardTitle>
        <CardDescription>
          Upload a new profile image. Max size: 5MB. Formats: JPEG, PNG, GIF, WebP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <Avatar className="w-32 h-32">
            <AvatarImage src={previewUrl || currentImage} alt={name || email} />
            <AvatarFallback className="text-2xl">
              {getInitials(name || '', email)}
            </AvatarFallback>
          </Avatar>
        </div>

        {!previewUrl ? (
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="profile-image-upload"
              />
              <label htmlFor="profile-image-upload">
                <Button variant="outline" className="w-full cursor-pointer" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </span>
                </Button>
              </label>
            </div>

            {currentImage && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4 mr-2" />
                Remove Current Image
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}