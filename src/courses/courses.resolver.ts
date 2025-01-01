import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Course } from './models/course.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseInput } from './dto/create-course-input';
import { ContentType, generateUniqueSlug } from 'src/common/utils/slug.utils';
import { UpdateCourseInput } from './dto/update-course.input';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [Course])
  async courses(): Promise<Course[]> {
    return this.prisma.course.findMany({
      include: {
        lessons: {
          include: {
            teacher: {
              include: {
                role: {
                  include: {
                    capabilities: true,
                  },
                },
              },
            },
          },
        },
        teacher: {
          include: {
            role: {
              include: {
                capabilities: true,
              },
            },
          },
        },
      },
    });
  }

  @Query(() => Course)
  async course(@Args('id') id: number): Promise<Course> {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          include: {
            teacher: {
              include: {
                role: {
                  include: {
                    capabilities: true,
                  },
                },
              },
            },
          },
        },
        teacher: {
          include: {
            role: {
              include: {
                capabilities: true,
              },
            },
          },
        },
      },
    });
  }

  @Mutation(() => Course)
  async createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
  ): Promise<Course> {
    const uniqueSlug = await generateUniqueSlug(
      createCourseInput.title,
      ContentType.COURSE,
    );

    return this.prisma.course.create({
      data: {
        title: createCourseInput.title,
        slug: uniqueSlug,
        description: createCourseInput.description,
        publishStatus: createCourseInput.publishStatus,
        order: createCourseInput.order,
        thumbnail: createCourseInput.thumbnail,
        teacherId: createCourseInput.teacherId,
      },
      include: {
        lessons: {
          include: {
            teacher: {
              include: {
                role: {
                  include: {
                    capabilities: true,
                  },
                },
              },
            },
          },
        },
        teacher: {
          include: {
            role: {
              include: {
                capabilities: true,
              },
            },
          },
        },
      },
    });
  }

  @Mutation(() => Course)
  async updateCourse(
    @Args('id') id: number,
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
  ): Promise<Course> {
    const uniqueSlug = await generateUniqueSlug(
      updateCourseInput.title,
      ContentType.COURSE,
      id,
    );

    return this.prisma.course.update({
      where: { id },
      data: {
        title: updateCourseInput.title,
        slug: uniqueSlug,
        description: updateCourseInput.description,
        publishStatus: updateCourseInput.publishStatus,
        order: updateCourseInput.order,
        thumbnail: updateCourseInput.thumbnail,
        teacherId: updateCourseInput.teacherId,
      },
      include: {
        lessons: {
          include: {
            teacher: {
              include: {
                role: {
                  include: {
                    capabilities: true,
                  },
                },
              },
            },
          },
        },
        teacher: {
          include: {
            role: {
              include: {
                capabilities: true,
              },
            },
          },
        },
      },
    });
  }

  @Mutation(() => Course)
  async deleteCourse(@Args('id') id: number): Promise<Course> {
    return this.prisma.course.delete({
      where: { id },
      include: {
        lessons: {
          include: {
            teacher: {
              include: {
                role: {
                  include: {
                    capabilities: true,
                  },
                },
              },
            },
          },
        },
        teacher: {
          include: {
            role: {
              include: {
                capabilities: true,
              },
            },
          },
        },
      },
    });
  }
}
