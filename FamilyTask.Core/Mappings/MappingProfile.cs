using AutoMapper;
using FamilyTask.Core.DTOs;
using FamilyTask.Core.Entities;

namespace FamilyTask.Core.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {            
            CreateMap<Member, MemberDto>();
            CreateMap<Member, MemberDtoSimplified>();
            CreateMap<CreateMemberDto, Member>();
            CreateMap<UpdateMemberDto, Member>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
           
            CreateMap<TaskItem, TaskDto>();
            CreateMap<TaskItem, TaskDtoSimplified>();
            CreateMap<CreateTaskDto, TaskItem>();
            CreateMap<UpdateTaskDto, TaskItem>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}