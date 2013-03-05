class StatReceive < ActiveRecord::Base
	attr_accessible :count, :from_time, :to_time, :user

	def self.get(user)
		find_by_sql ['SELECT from_time, to_time, count FROM stat_receives WHERE user = ?', user]		
	end
end
