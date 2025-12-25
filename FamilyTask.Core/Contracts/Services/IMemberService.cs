using FamilyTask.Core.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FamilyTask.Core.Contracts.Services
{
    public interface IMemberService
    {
        Task<IEnumerable<MemberDto>> GetAllMembersAsync();
        Task<MemberDto> GetMemberByIdAsync(Guid id);
        Task<MemberDto> CreateMemberAsync(CreateMemberDto memberDto);
        Task UpdateMemberAsync(Guid id, UpdateMemberDto memberDto);
        Task DeleteMemberAsync(Guid id);
    }
}