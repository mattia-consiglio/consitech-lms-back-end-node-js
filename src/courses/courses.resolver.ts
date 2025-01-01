import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Course } from './models/course.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseInput } from './dto/create-course-input';
import { ContentType, generateUniqueSlug } from 'src/common/utils/slug.utils';
import { UpdateCourseInput } from './dto/update-course.input';
import { UserSimple } from 'src/users/models/user-simple.model';
import { Lesson } from 'src/lessons/models/lesson.model';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { CapabilitiesGuard } from 'src/auth/guards/capabilities.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Capabilities } from 'src/auth/decorators/capabilities.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/models/user.model';
import { Public } from 'src/auth/decorators/public.decorator';
import { PublishStatus } from '@prisma/client';

@Resolver(() => Course)
export class CoursesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Query(() => [Course], {
    description: 'Get all published courses',
  })
  async coursesPublic() {
    return this.prisma.course.findMany({
      where: {
        publishStatus: PublishStatus.PUBLISHED,
      },
    });
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('edit_courses')
  @Query(() => [Course], {
    description: 'Get all courses',
  })
  async courses() {
    return this.prisma.course.findMany();
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('edit_course_self')
  @Query(() => [Course], {
    description: 'Get all courses by teacher id',
  })
  async coursesOwn(@CurrentUser() user: User) {
    return this.prisma.course.findMany({
      where: {
        OR: [
          { teacherId: user.id },
          { publishStatus: PublishStatus.PUBLISHED },
        ],
      },
    });
  }

  @Query(() => Course, {
    nullable: true,
    description:
      'Get a course by id or slug. If both are provided, the id will be used.',
  })
  async course(
    @Args('id', { nullable: true }) id: number,
    @Args('slug', { nullable: true }) slug: string,
  ) {
    if (!id && !slug) {
      throw new BadRequestException('Either id or slug must be provided');
    }
    if (id) {
      return this.prisma.course.findUnique({
        where: { id },
      });
    }
    return this.prisma.course.findUnique({
      where: { slug },
    });
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('create_courses')
  @Mutation(() => Course, {
    description: 'Create a new course',
  })
  async createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
  ) {
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
    });
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('update_courses')
  @Mutation(() => Course, {
    description: 'Update a course',
  })
  async updateCourse(
    @Args('id') id: number,
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
  ) {
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
    });
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('update_course_self')
  @Mutation(() => Course, {
    description: 'Update a course that you own',
  })
  async updateOwnCourse(
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
    @CurrentUser() user: User,
  ) {
    return this.updateCourse(user.id, updateCourseInput);
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('delete_courses')
  @Mutation(() => Course, {
    description: 'Delete a course',
  })
  async deleteCourse(@Args('id') id: number) {
    return this.prisma.course.delete({
      where: { id },
    });
  }

  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @Capabilities('delete_course_self')
  @Mutation(() => Course, {
    description: 'Delete a course that you own',
  })
  async deleteOwnCourse(@Args('id') id: number, @CurrentUser() user: User) {
    try {
      return await this.prisma.course.delete({
        where: { id, teacherId: user.id },
      });
    } catch {
      throw new BadRequestException('Unable to delete course');
    }
  }

  @ResolveField(() => [Lesson])
  async lessons(@Parent() course: Course) {
    return this.prisma.lesson.findMany({
      where: { courseId: course.id },
    });
  }

  @ResolveField(() => UserSimple)
  async teacher(@Parent() course: Course) {
    return this.prisma.user.findUnique({
      where: { id: course.teacherId },
    });
  }
}
