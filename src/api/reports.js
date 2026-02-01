import { supabase } from './supabase.js';

export const reportService = {
    async getAllReports() {
        const { data, error } = await supabase
            .from('reports')
            .select(`
                *,
                profiles (name, avatar_url),
                report_followers (count)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async createReport(reportData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        let image_url = null;
        if (reportData.image) {
            const file = reportData.image;
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('report-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('report-images')
                .getPublicUrl(filePath);
            
            image_url = publicUrl;
        }

        const { data, error } = await supabase
            .from('reports')
            .insert([{
                user_id: user.id,
                title: reportData.title,
                description: reportData.description,
                category: reportData.category,
                latitude: reportData.latitude,
                longitude: reportData.longitude,
                image_url: image_url,
                status: 'open'
            }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async getReportById(id) {
        const { data, error } = await supabase
            .from('reports')
            .select(`
                *,
                profiles (name, avatar_url),
                report_updates (*, profiles(name, avatar_url)),
                comments (*, profiles(name, avatar_url))
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    async addComment(reportId, content) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('comments')
            .insert([{ report_id: reportId, user_id: user.id, content }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async followReport(reportId) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('report_followers')
            .insert([{ report_id: reportId, user_id: user.id }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async isFollowing(reportId) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('report_followers')
            .select('id')
            .eq('report_id', reportId)
            .eq('user_id', user.id);
        if (error) return false;
        return data.length > 0;
    },

    async addUpdate(reportId, content) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('report_updates')
            .insert([{ report_id: reportId, user_id: user.id, content }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async updateStatus(reportId, status) {
        const { data, error } = await supabase
            .from('reports')
            .update({ status })
            .eq('id', reportId)
            .select();
        if (error) throw error;
        return data[0];
    },

    async hideReport(reportId, isHidden) {
        const { data, error } = await supabase
            .from('reports')
            .update({ is_hidden: isHidden })
            .eq('id', reportId)
            .select();
        if (error) throw error;
        return data[0];
    },

    async getAllReportsAdmin() {
        const { data, error } = await supabase
            .from('reports')
            .select(`
                *,
                profiles (name, avatar_url)
            `)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }
};
