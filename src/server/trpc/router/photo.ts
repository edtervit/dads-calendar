import {z} from "zod";

import {router, protectedProcedure, adminProcedure} from "../trpc";
import {v2 as cloudinary} from 'cloudinary';
import {env} from "../../../env/server.mjs";


export const photoRouter = router({
  getSignatureForUpload: adminProcedure
  .input(z.object({eager: z.string()}))
  .query(({input}) => {
    //get signature from cloudinary
    const timestamp = Math.round((new Date).getTime()/1000);
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
        eager: input.eager,
      }, env.CLOUDINARY_SECRET_API_KEY);
    
    return { timestamp, signature }
  }),
  addPhoto: adminProcedure
    .input(z.object({raceId: z.number(), url: z.string(), cloudinaryId: z.string()}))
    .mutation(async ({ctx, input}) => {
      //add to db
      try {
        await ctx.prisma.photo.create({
          data: {
            raceId: input.raceId,
            url: input.url,
            cloudinaryId: input.cloudinaryId,
          }
        })
        return {success: true}
      } catch (error) {
        return {success: false, error}
      }
    }),
      
  deletePhoto: protectedProcedure
    .input(z.object({raceId: z.number(), cloudinaryId: z.string()}))
    .mutation(async ({ctx, input}) => {
      //delete from cloudinary, then delete from db
      try {
        cloudinary.config({
          api_key: env.CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_SECRET_API_KEY,
          cloud_name: env.CLOUDINARY_CLOUD_NAME
        });
        await cloudinary.uploader.destroy(input.cloudinaryId)
        await ctx.prisma.photo.delete({
          where: {
            raceId: input.raceId
          }
        })
        return {success: true}
      } catch (error) {
        return {success: false, error}
      }
 
    }),
});
