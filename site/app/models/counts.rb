class Counts < ActiveRecord::Base
	attr_accessible :count, :start, :timescale, :type, :user

	def self.volume(user, timescale, month, day)
  		case timescale
  		when 'd'
			if month
				find_by_sql ['SELECT SUM(count) FROM counts WHERE user = ? AND type = 1 AND timescale = 24 AND created_at > NOW() - INTERVAL 365 DAY AND MONTH(created_at) = ? GROUP BY DAY(created_at)', user, month]
			else
				find_by_sql ['SELECT SUM(count) FROM counts WHERE user = ? AND type = 1 AND timescale = 24 AND created_at > NOW() - INTERVAL 365 DAY GROUP BY DAY(created_at)', user]
			end
		when 'h'
			if day && month
				find_by_sql ['SELECT SUM(count) FROM counts WHERE user = ? AND type = 1 AND timescale = 15 AND created_at > NOW() - INTERVAL 365 DAY AND MONTH(created_at) = ? AND DAY(created_at) = ? GROUP BY HOUR(created_at)', user, month, day]
			elsif day
				find_by_sql ['SELECT SUM(count) FROM counts WHERE user = ? AND type = 1 AND timescale = 15 AND created_at > NOW() - INTERVAL 365 DAY AND DAY(created_at) = ? GROUP BY HOUR(created_at)', user, day]
			elsif month
				find_by_sql ['SELECT SUM(count) FROM counts WHERE user = ? AND type = 1 AND timescale = 15 AND created_at > NOW() - INTERVAL 365 DAY AND MONTH(created_at) = ? GROUP BY HOUR(created_at)', user, month]
			else
				find_by_sql ['SELECT SUM(count) FROM counts WHERE user = ? AND type = 1 AND timescale = 15 AND created_at > NOW() - INTERVAL 365 DAY GROUP BY HOUR(created_at)', user]
			end
		else
			find_by_sql ['SELECT SUM(count) FROM counts WHERE user = ? AND type = 1 AND timescale = 30 AND created_at > NOW() - INTERVAL 365 DAY GROUP BY MONTH(created_at)', user]
		end
	end

	def self.delay(user)
		find_by_sql ['SELECT SUM(count), timescale FROM counts WHERE user = ? AND type = 2 AND created_at > NOW() - INTERVAL 365 DAY GROUP BY timescale', user]
	end
end
