import Image from 'next/image';
import React, {useState} from 'react'
import {Dialog} from '@headlessui/react'
import {trpc} from '../utils/trpc';
import type {RaceWithPhotosAndCourse} from '../types/race';
import {env} from '../env/client.mjs';

interface props {
  race: RaceWithPhotosAndCourse;
  isAdmin: boolean;
}

function ImageManager({race}: props) {
  const [showUploader, setShowUploader] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [tempImage, setTempImageData] = useState<{url: string, cloudinaryId: string} | null>(null)
  const [deletedImage, setDeletedImage] = useState(false)
  const [deletingImage, setDeletingImage] = useState(false)

  const [imageToUpload, setImageToUpload] = useState<File | null>(null)

  // const {data: image} = trpc.photo.useQuery

  const addPhotoToDb = trpc.photo.addPhoto.useMutation();
  const deletePhoto = trpc.photo.deletePhoto.useMutation();

  //eager has to be signed 
  const eager = 'c_limit,h_2048,q_auto:good,w_2048'
  const {refetch: getSignatureForUpload} = trpc.photo.getSignatureForUpload.useQuery({eager}, {
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    //get image from paste
    const files = e.clipboardData.files;
    if (files.length === 0) alert('No images found in clipboard.');
    const filesArray: File[] = Array.from(files);
    //check if all files are image/jpeg or image/png
    const allImagesArePNGorJPEG = filesArray.every((file: File) => file.type === 'image/jpeg' || file.type === 'image/png');
    if (!allImagesArePNGorJPEG) {
      alert('Please only paste PNG or JPEG images.');
      return;
    }

    filesArray[0] && setImageToUpload(filesArray[0])
  }

  const handleUploadImage = async () => {
    setUploadingImages(true);
    //upload image to cloudinary
    const sigObject = await getSignatureForUpload()
    const url = `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`

    const formData = new FormData();
    formData.append('file', imageToUpload as File);
    sigObject.data?.timestamp && formData.append('timestamp', sigObject.data?.timestamp.toString());
    sigObject.data?.signature && formData.append('signature', sigObject.data?.signature);
    formData.append('api_key', env.NEXT_PUBLIC_CLOUDINARY_API_KEY)
    formData.append('eager', eager)
    const uploadRes = await fetch(url, {
      method: 'POST',
      body: formData
    })
    const resJson = await uploadRes.json()

    //if upload fails, console.error the error and display alert to user
    if (!uploadRes.ok) {
      console.error(resJson)
      alert('Upload failed. Please try again.')
      setUploadingImages(false)
      return;
    }

    //if upload is a success save the secure)url, raceId and public_id to the database 
    if (uploadRes.ok && resJson.secure_url && resJson.public_id) {
      const addToDb = await addPhotoToDb.mutateAsync({raceId: race.id, url: resJson.secure_url, cloudinaryId: resJson.public_id})
      if (addToDb.success) {
        setShowUploader(false)
        setUploadingImages(false)
        setDeletedImage(false)
        setDeletingImage(false)
        setTempImageData({url: resJson.secure_url, cloudinaryId: resJson.public_id})
      }
      if (addToDb.error) {
        console.error(addToDb.error)
        alert('Failed saving to db. Please tell Ed.')
        setUploadingImages(false)
      }
    }
  }

  const handleDeleteImage = async () => {
    setDeletingImage(true)
    //delete image from cloudinary
    if (tempImage?.cloudinaryId !== undefined || race.photo?.cloudinaryId !== undefined) {
      const publicId: string = tempImage?.cloudinaryId ?? race.photo?.cloudinaryId ?? '';
      const res = await deletePhoto.mutateAsync({raceId: race.id, cloudinaryId: publicId})
      if (res.success) {
        setTempImageData(null)
        setDeletingImage(false)
        setDeletedImage(true)
      }
      if (res.error) {
        console.error(res.error)
        setDeletingImage(false)
        alert('Failed to delete image. Please tell Ed.')
      }
    }
  }

  return (
    <div>
      <div className='button-cont flex justify-center mt-2'>
        {(race?.photo?.url || tempImage) && !deletedImage && <Image src={'/img-white.svg'} width={30} height={30} alt={'image icon'} className='cursor-pointer hover:scale-110 transition-transform' onClick={() => setShowViewer(true)} />}
        {(!race?.photo?.url && !tempImage) && <Image src={'/upload.svg'} width={30} height={30} alt={'upload icon'} className='cursor-pointer hover:scale-110 transition-transform' onClick={() => setShowUploader(true)} />}
      </div>
      {(race?.photo?.url || tempImage) && !deletedImage && <Dialog as="div" className="relative z-10" open={showViewer} onClose={() => setShowViewer(false)}>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full h-full transform overflow-hidden rounded-2xl bg-black/95 p-6 shadow-xl transition-all flex justify-center items-center flex-col">
              <button onClick={() => setShowViewer((false))} className='absolute top-5 right-10 text-white text-3xl cursor-pointer border-white border px-2 hover:scale-110'>X</button>
              <Image src={race?.photo?.url ?? tempImage?.url ?? ''} width={500} height={900} alt='uknown' />
              <div>
                <button className='text-white bg-red-900 rounded-sm p-2 cursor-pointer hover:scale-110 transition-transform mt-2' onClick={() => !deletingImage && handleDeleteImage()}>{deletingImage ? "Deleting.." : "Delete"}</button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>}
      {(!race?.photo?.url || deletedImage && !tempImage) && <Dialog as="div" className="relative z-10" open={showUploader} onClose={() => setShowUploader(false)}>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full h-full transform overflow-hidden rounded-2xl bg-black/95 p-6 shadow-xl transition-all flex justify-center items-center flex-col">
              <button onClick={() => setShowUploader((false))} className='absolute top-5 right-10 text-white text-3xl cursor-pointer border-white border px-2 hover:scale-110'>X</button>
              <div>
                {!imageToUpload && <div>
                  <textarea value={'Right click and paste your image here'} className='border  text-center border-white bg-black cursor-default p-10 text-white' onPaste={(e) => handlePaste(e)} onChange={() => null} >
                  </textarea>
                </div>}
                {imageToUpload && <Image src={URL.createObjectURL(imageToUpload)} width={500} height={900} className={'w-auto h-auto'} alt='uknown' />}
                {imageToUpload && <>
                  {!uploadingImages && <button className='text-white border border-white mr-4 rounded-sm p-2 cursor-pointer hover:scale-110 transition-transform mt-2' onClick={() => setImageToUpload(null)}>
                    Clear
                  </button>}
                  <button className='text-black border-white border bg-white rounded-sm p-2 cursor-pointer hover:scale-110 transition-transform mt-2' onClick={() => !uploadingImages && handleUploadImage()}>
                    {uploadingImages ? 'Uploading...' : "Upload"}
                  </button></>}
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>}

    </div>
  )

}


export default ImageManager