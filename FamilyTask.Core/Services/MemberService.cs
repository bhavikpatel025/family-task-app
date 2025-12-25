using AutoMapper;
using FamilyTask.Core.Contracts.Repositories;
using FamilyTask.Core.Contracts.Services;
using FamilyTask.Core.DTOs;
using FamilyTask.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FamilyTask.Core.Services
{
    public class MemberService : IMemberService
    {
        private readonly IMemberRepository _memberRepository;
        private readonly IMapper _mapper;

        public MemberService(IMemberRepository memberRepository, IMapper mapper)
        {
            _memberRepository = memberRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<MemberDto>> GetAllMembersAsync()
        {
            var members = await _memberRepository.GetAllMembersAsync();
            return _mapper.Map<IEnumerable<MemberDto>>(members);
        }

        public async Task<MemberDto> GetMemberByIdAsync(Guid id)
        {
            var member = await _memberRepository.GetMemberByIdAsync(id);
            return _mapper.Map<MemberDto>(member);
        }

        public async Task<MemberDto> CreateMemberAsync(CreateMemberDto memberDto)
        {
            var member = _mapper.Map<Member>(memberDto);
            var createdMember = await _memberRepository.AddMemberAsync(member);
            return _mapper.Map<MemberDto>(createdMember);
        }

        public async Task UpdateMemberAsync(Guid id, UpdateMemberDto memberDto)
        {
            var existingMember = await _memberRepository.GetMemberByIdAsync(id);
            if (existingMember == null)
                throw new KeyNotFoundException($"Member with ID {id} not found.");

            _mapper.Map(memberDto, existingMember);
            await _memberRepository.UpdateMemberAsync(existingMember);
        }

        public async Task DeleteMemberAsync(Guid id)
        {
            await _memberRepository.DeleteMemberAsync(id);
        }
    }
}