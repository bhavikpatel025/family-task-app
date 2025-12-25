using FamilyTask.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FamilyTask.Core.Contracts.Repositories
{
    public interface IMemberRepository
    {
        Task<IEnumerable<Member>> GetAllMembersAsync();
        Task<Member> GetMemberByIdAsync(Guid id);
        Task<Member> AddMemberAsync(Member member);
        Task UpdateMemberAsync(Member member);
        Task DeleteMemberAsync(Guid id);
    }
}