<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileCannotBeAdded;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig;
use Spatie\MediaLibrary\MediaCollections\Exceptions\InvalidBase64Data;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaHelper {
    /**
     * Validate if the given string is a valid base64 image.
     *
     * @param  string  $base64String
     *
     * @return bool
     */
    public static function isValidBase64Image(string $base64String)
    {
        $base64String = preg_replace('#^data:image/\w+;base64,#i', '', $base64String);
        $base64String = trim($base64String);

        return ! ($base64String == NULL);
    }
    /**
     * Add a base64 encoded image to a model's media collection
     *
     * @param  HasMedia     $model           The model to add media to
     * @param  string       $base64Image     The base64 encoded image
     * @param  string       $collection      The media collection name
     * @param  string|null  $customFilename  Custom filename (without extension)
     *
     * @return Media|null
     */
    public static function addMediaFromBase64(
        HasMedia $model,
        string $base64Image,
        string $collection = 'default',
        ?string $customFilename = NULL
    ): ?Media {
        if (empty($base64Image) || ! Str::startsWith($base64Image, 'data:image')) {
            return NULL;
        }

        // Generate filename if not provided
        $filename = $customFilename ?? Str::slug(class_basename($model)).'-'.$model->getKey().'-'.Str::random(6);

        try {
            return $model->addMediaFromBase64($base64Image)
                ->usingFileName($filename.'.jpg')
                ->toMediaCollection($collection);
        } catch (FileDoesNotExist|FileIsTooBig|InvalidBase64Data|FileCannotBeAdded $e) {
            return NULL;
        }
    }

    /**
     * Add a file upload to a model's media collection
     *
     * @param  HasMedia      $model           The model to add media to
     * @param  UploadedFile  $file            The uploaded file
     * @param  string        $collection      The media collection name
     * @param  string|null   $customFilename  Custom filename (without extension)
     *
     * @return Media|null
     */
    public static function addMediaFromUpload(
        HasMedia $model,
        UploadedFile $file,
        string $collection = 'default',
        ?string $customFilename = NULL
    ): ?Media {
        if ( ! $file->isValid()) {
            return NULL;
        }

        // Generate filename if not provided
        $filename  = $customFilename ?? Str::slug(class_basename($model)).'-'.$model->getKey().'-'.Str::random(6);
        $extension = $file->getClientOriginalExtension();

        try {
            return $model->addMedia($file)
                ->usingFileName($filename.'.'.$extension)
                ->toMediaCollection($collection);
        } catch (FileIsTooBig|FileDoesNotExist $e) {
            return NULL;
        }
    }

    /**
     * Delete all media from a collection
     *
     * @param  HasMedia  $model       The model to delete media from
     * @param  string    $collection  The media collection name
     *
     * @return void
     */
    public static function clearMediaCollection(HasMedia $model, string $collection = 'default'): void
    {
        $model->clearMediaCollection($collection);
    }

}
