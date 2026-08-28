package com.yoone.hannunmagnifier;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

@CapacitorPlugin(
    name = "ImageSaver",
    permissions = { @Permission(alias = "storage", strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }) }
)
public class ImageSaverPlugin extends Plugin {
    @PluginMethod
    public void save(PluginCall call) {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P && getPermissionState("storage") != PermissionState.GRANTED) {
            requestPermissionForAlias("storage", call, "storagePermissionCallback");
            return;
        }
        saveImage(call);
    }

    @PermissionCallback
    public void storagePermissionCallback(PluginCall call) {
        if (getPermissionState("storage") != PermissionState.GRANTED) {
            call.reject("사진을 저장하려면 저장공간 권한이 필요합니다.");
            return;
        }
        saveImage(call);
    }

    private void saveImage(PluginCall call) {
        String dataUrl = call.getString("dataUrl");
        String requestedName = call.getString("filename", "한눈돋보기.jpg");
        if (dataUrl == null || !dataUrl.contains(",")) {
            call.reject("올바른 이미지가 아닙니다.");
            return;
        }

        String filename = requestedName.replaceAll("[^a-zA-Z0-9가-힣._-]", "-");
        byte[] imageBytes;
        try {
            imageBytes = Base64.decode(dataUrl.substring(dataUrl.indexOf(',') + 1), Base64.DEFAULT);
        } catch (IllegalArgumentException error) {
            call.reject("이미지를 읽을 수 없습니다.", error);
            return;
        }

        try {
            Uri savedUri;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                savedUri = saveWithMediaStore(imageBytes, filename);
            } else {
                savedUri = saveLegacy(imageBytes, filename);
            }
            JSObject result = new JSObject();
            result.put("uri", savedUri.toString());
            call.resolve(result);
        } catch (Exception error) {
            call.reject("사진을 저장하지 못했습니다.", error);
        }
    }

    private Uri saveWithMediaStore(byte[] imageBytes, String filename) throws Exception {
        ContentValues values = new ContentValues();
        values.put(MediaStore.Images.Media.DISPLAY_NAME, filename);
        values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
        values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/한눈돋보기");
        values.put(MediaStore.Images.Media.IS_PENDING, 1);

        ContentResolver resolver = getContext().getContentResolver();
        Uri uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
        if (uri == null) throw new IllegalStateException("사진 저장 위치를 만들 수 없습니다.");
        try (OutputStream stream = resolver.openOutputStream(uri)) {
            if (stream == null) throw new IllegalStateException("사진 파일을 열 수 없습니다.");
            stream.write(imageBytes);
        } catch (Exception error) {
            resolver.delete(uri, null, null);
            throw error;
        }

        values.clear();
        values.put(MediaStore.Images.Media.IS_PENDING, 0);
        resolver.update(uri, values, null, null);
        return uri;
    }

    @SuppressWarnings("deprecation")
    private Uri saveLegacy(byte[] imageBytes, String filename) throws Exception {
        File folder = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "한눈돋보기");
        if (!folder.exists() && !folder.mkdirs()) throw new IllegalStateException("사진 폴더를 만들 수 없습니다.");
        File file = new File(folder, filename);
        try (FileOutputStream stream = new FileOutputStream(file)) {
            stream.write(imageBytes);
        }
        MediaScannerConnection.scanFile(getContext(), new String[] { file.getAbsolutePath() }, new String[] { "image/jpeg" }, null);
        return Uri.fromFile(file);
    }
}
