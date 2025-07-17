import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Task | null> {
    return this.taskService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateTaskDto): Promise<Task> {
    return this.taskService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<Task>) {
    return this.taskService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.taskService.remove(id);
  }
}