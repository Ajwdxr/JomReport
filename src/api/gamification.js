import { supabase } from './supabase.js';

export const gamificationService = {
    async addPoints(userId, action) {
        const pointsConfig = {
            'CREATE_REPORT': 10,
            'POST_UPDATE': 5,
            'COMMENT': 2,
            'CONFIRM_RESOLUTION': 3,
            'REPORT_CLOSED': 15
        };

        const pointsToAdd = pointsConfig[action] || 0;
        
        const { data, error } = await supabase.rpc('increment_points', { 
            user_id: userId, 
            points_to_add: pointsToAdd 
        });

        if (error) console.error('Error adding points:', error);
        return data;
    },

    async checkBadges(userId) {
        // Logic to check and award badges could be here or in an Edge Function
        // For now, we'll assume badges are handled via database triggers or manual checks
    }
};
