class StatDeliver < ActiveRecord::Base
	attr_accessible :count, :duration, :from_time, :to_time, :user

	def self.get(user)
		find_by_sql ['SELECT count, duration FROM stat_delivers WHERE user = ? GROUP BY duration', user]
	end
end
