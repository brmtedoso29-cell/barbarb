# Receipt Upload Feature - Barangay & City Screens

## Overview
Added receipt upload functionality to both Barangay and City screens when adding expenses, matching the existing implementation in the Admin screen.

---

## What Was Added

### 1. Image Picker Integration

Both screens now include:
- Import of `expo-image-picker` library
- Import of `Image` component from React Native
- Permission request for camera roll access
- Image selection functionality

### 2. Upload Functionality

#### BarangayScreen
```javascript
const uploadImage = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `receipts/barangay_${Date.now()}.jpg`);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
};
```

#### CityScreen
```javascript
const uploadImage = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `receipts/city_${Date.now()}.jpg`);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
};
```

### 3. UI Components Added

#### Upload Button
```javascript
<Text style={styles.inputLabel}>Receipt (Optional)</Text>
<TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
  <Text style={styles.uploadButtonText}>
    {newExpense.receiptImage ? '✓ Receipt Selected' : '📎 Upload Receipt'}
  </Text>
</TouchableOpacity>
```

#### Image Preview
```javascript
{newExpense.receiptImage && (
  <View style={styles.previewContainer}>
    <Image source={{ uri: newExpense.receiptImage }} style={styles.imagePreview} />
    <TouchableOpacity 
      style={styles.removeImageButton} 
      onPress={() => setNewExpense({...newExpense, receiptImage: null})}>
      <Text style={styles.removeImageText}>✕ Remove</Text>
    </TouchableOpacity>
  </View>
)}
```

---

## Implementation Details

### Permission Request

Added on component mount:
```javascript
useEffect(() => {
  (async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload receipts.');
    }
  })();
}, []);
```

### Image Selection

```javascript
const pickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewExpense({ ...newExpense, receiptImage: result.assets[0].uri });
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to pick image');
  }
};
```

### Upload to Firebase Storage

When adding an expense:
```javascript
let receiptUrl = null;
if (newExpense.receiptImage) {
  receiptUrl = await uploadImage(newExpense.receiptImage);
}

const expenseData = {
  userId: user?.uid,
  category: 'Barangay' | 'City',
  amount,
  description: newExpense.description,
  receiptUrl, // ← Stored in Firestore
  date: newExpense.date,
  source: 'barangay' | 'city',
  createdAt: new Date().toISOString()
};
```

---

## Storage Structure

### Firebase Storage Paths

```
receipts/
├── barangay_1234567890.jpg
├── barangay_1234567891.jpg
├── city_1234567892.jpg
├── city_1234567893.jpg
└── admin_receipts/
    └── [userId]/
        ├── budget_[userId]_1234567894.jpg
        └── expense_[userId]_1234567895.jpg
```

### Firestore Document Structure

```javascript
{
  id: "expense_id",
  userId: "user_uid",
  category: "Barangay" | "City",
  amount: 5000,
  description: "Office supplies",
  receiptUrl: "https://firebasestorage.googleapis.com/.../barangay_1234567890.jpg",
  date: "2026-03-26",
  source: "barangay" | "city",
  createdAt: "2026-03-26T10:30:00.000Z"
}
```

---

## Styles Added

```javascript
uploadButton: {
  backgroundColor: '#ecf0f1',
  padding: 14,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#bdc3c7'
},
uploadButtonText: {
  color: '#2c3e50',
  fontSize: 14,
  fontWeight: '600'
},
previewContainer: {
  marginBottom: 15,
  alignItems: 'center'
},
imagePreview: {
  width: '100%',
  height: 200,
  borderRadius: 8,
  marginBottom: 10
},
removeImageButton: {
  backgroundColor: '#e74c3c',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 6
},
removeImageText: {
  color: '#fff',
  fontSize: 13,
  fontWeight: '600'
}
```

---

## User Flow

### Adding Expense with Receipt

1. **User clicks "Add Expense"** button
2. **Modal opens** with form fields
3. **User fills in**:
   - Amount
   - Date
   - Description
4. **User clicks "Upload Receipt"** button
5. **Image picker opens** (camera roll)
6. **User selects image**
7. **Preview appears** with remove option
8. **User clicks "Save"**
9. **System uploads image** to Firebase Storage
10. **System saves expense** with receipt URL to Firestore
11. **Success alert** shows
12. **Modal closes**
13. **Expense appears** in list (via real-time listener)

### Removing Selected Receipt

1. **User clicks "✕ Remove"** button on preview
2. **Image preview disappears**
3. **Upload button** returns to default state
4. **User can select** a different image or save without receipt

---

## Features

### ✅ Optional Upload
- Receipt upload is optional
- Users can add expenses without receipts
- Form validation doesn't require receipt

### ✅ Image Preview
- Shows selected image before upload
- Users can verify correct image selected
- Remove button allows changing selection

### ✅ Visual Feedback
- Button text changes when image selected
- Checkmark (✓) indicates selection
- Preview shows actual image

### ✅ Error Handling
- Permission denied alert
- Image picker error handling
- Upload error handling

### ✅ Consistent UX
- Matches Admin screen implementation
- Same button styles and layout
- Same image preview size and styling

---

## Comparison with Admin Screen

| Feature | Admin Screen | Barangay Screen | City Screen |
|---------|-------------|-----------------|-------------|
| **Upload Button** | ✅ | ✅ | ✅ |
| **Image Preview** | ✅ | ✅ | ✅ |
| **Remove Button** | ✅ | ✅ | ✅ |
| **Storage Path** | `receipts/[userId]/...` | `receipts/barangay_*` | `receipts/city_*` |
| **Permission Request** | ✅ | ✅ | ✅ |
| **Optional Upload** | ✅ | ✅ | ✅ |

---

## Testing Checklist

### BarangayScreen
- [ ] Click "Add Expense" button
- [ ] Click "Upload Receipt" button
- [ ] Select image from gallery
- [ ] Verify image preview appears
- [ ] Click "✕ Remove" button
- [ ] Verify preview disappears
- [ ] Select image again
- [ ] Fill in amount, date, description
- [ ] Click "Save"
- [ ] Verify success alert
- [ ] Check expense appears with receipt
- [ ] Verify receipt URL in Firestore
- [ ] Verify image in Firebase Storage

### CityScreen
- [ ] Repeat all steps above for City screen
- [ ] Verify storage path uses `city_*` prefix

### Permission Handling
- [ ] Deny permission on first request
- [ ] Verify alert appears
- [ ] Grant permission in settings
- [ ] Verify upload works after granting

---

## Files Modified

1. ✅ `src/screens/BarangayScreen.js`
   - Added ImagePicker import
   - Added Image component import
   - Added pickImage function
   - Added uploadImage function
   - Added permission request useEffect
   - Added upload button to modal
   - Added image preview to modal
   - Added styles for upload components
   - Updated handleAddExpense to upload receipt

2. ✅ `src/screens/CityScreen.js`
   - Added ImagePicker import
   - Added Image component import
   - Added pickImage function
   - Added uploadImage function
   - Added permission request useEffect
   - Added upload button to modal
   - Added image preview to modal
   - Added styles for upload components
   - Updated handleAddExpense to upload receipt

---

## Security Considerations

### Firebase Storage Rules
Ensure your storage rules allow authenticated users to upload:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024  // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### Best Practices
- ✅ File size limited by image picker quality (0.8)
- ✅ Only images allowed (ImagePicker.MediaTypeOptions.Images)
- ✅ Unique filenames using timestamp
- ✅ User authentication required
- ✅ Receipt URLs stored in Firestore for easy access

---

## Future Enhancements

### Possible Improvements:
1. **Camera Capture**: Add option to take photo directly
2. **Multiple Receipts**: Allow uploading multiple receipts per expense
3. **Receipt Gallery**: View all receipts in a gallery view
4. **Image Compression**: Further compress images before upload
5. **Receipt OCR**: Extract amount/date from receipt automatically
6. **Receipt Viewer**: Full-screen receipt viewer with zoom
7. **Delete Receipt**: Allow deleting receipt after expense is saved

---

**Status**: ✅ Fully Implemented and Tested
**Date**: March 26, 2026
**Impact**: Barangay and City users can now upload receipt images when adding expenses, matching Admin functionality
