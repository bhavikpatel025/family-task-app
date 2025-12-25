using FamilyTask.Core.Contracts.Repositories;
using FamilyTask.Core.Entities;
using FamilyTask.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FamilyTask.Infrastructure.Repositories
{
    public class MemberRepository : IMemberRepository
    {
        private readonly ApplicationDbContext _context;

        public MemberRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Member>> GetAllMembersAsync()
        {
            return await _context.Members
                .Include(m => m.Tasks)
                .ToListAsync();
        }

        public async Task<Member> GetMemberByIdAsync(Guid id)
        {
            return await _context.Members
                .Include(m => m.Tasks)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<Member> AddMemberAsync(Member member)
        {
            member.Id = Guid.NewGuid();
            _context.Members.Add(member);
            await _context.SaveChangesAsync();
            return member;
        }

        public async Task UpdateMemberAsync(Member member)
        {
            _context.Members.Update(member);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteMemberAsync(Guid id)
        {
            var member = await _context.Members.FindAsync(id);
            if (member != null)
            {
                _context.Members.Remove(member);
                await _context.SaveChangesAsync();
            }
        }
    }
}