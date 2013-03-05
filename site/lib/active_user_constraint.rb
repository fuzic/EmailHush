class ActiveUserConstraint
	def self.matches?(r)
		user = User.find(r.session[:user_id]) if r.session[:user_id]
		user && user.state == 2
	end
end
