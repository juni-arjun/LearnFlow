import { supabase } from '../lib/supabase';

export const apiService = {
  async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('role_name');

    if (error) throw error;
    return data;
  },

  async getRoleSkills(roleName: string) {
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('role_name', roleName)
      .maybeSingle();

    if (roleError) throw roleError;
    if (!roleData) return [];

    const { data, error } = await supabase
      .from('role_skills')
      .select('*')
      .eq('role_id', roleData.id)
      .order('order_index');

    if (error) throw error;
    return data;
  },

  async createUser(name: string, email: string, targetRole: string, experienceLevel: string) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name,
        email, // <--- Now saving the email
        target_role: targetRole,
        experience_level: experienceLevel,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addUserSkills(userId: string, skills: string[]) {
    const skillsData = skills.map(skill => ({
      user_id: userId,
      skill_name: skill.trim(),
    }));

    const { error } = await supabase
      .from('user_skills')
      .insert(skillsData);

    if (error) throw error;
  },

  async getUserSkills(userId: string) {
    const { data, error } = await supabase
      .from('user_skills')
      .select('skill_name')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(s => s.skill_name);
  },

  async getLearningResources(skillName: string) {
    const { data, error } = await supabase
      .from('learning_resources')
      .select('*')
      .eq('skill_name', skillName)
      .limit(3);

    if (error) throw error;
    return data;
  },

  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('skill_name')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(p => p.skill_name);
  },

  async markSkillComplete(userId: string, skillName: string) {
    const { error } = await supabase
      .from('user_progress')
      .insert([{
        user_id: userId,
        skill_name: skillName,
      }]);

    if (error) throw error;
  },

  async markSkillIncomplete(userId: string, skillName: string) {
    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)
      .eq('skill_name', skillName);

    if (error) throw error;
  },

  async findUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // Returns null if not found (instead of crashing)

    if (error) throw error;
    return data;
  },

  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
