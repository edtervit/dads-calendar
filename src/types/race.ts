import type {Prisma} from '@prisma/client';


export type RaceWithPhotosAndCourse = Prisma.RaceGetPayload<{
  include: {photo: true, course: true}
}>
