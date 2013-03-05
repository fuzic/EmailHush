class User < ActiveRecord::Base
	validates_format_of :state, :with => /\A[0-2]\z/
	attr_accessible :state, :refresh_token, :calendar_id, :timezone, :name, :override, :override_mode, :calendar_cache, :calendar_cache_updated

	def self.create_with_omniauth(auth)
		create! do |user|
			user.provider = auth.provider
			user.uid = auth.uid
			user.state = 0
			user.email = auth.info.email
		end
	end
end
