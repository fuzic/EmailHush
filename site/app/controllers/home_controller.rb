class HomeController < ApplicationController
	protect_from_forgery

	def index
		@state = 2
		if !current_user
			@state = 0
		elsif current_user.state == 0
			@state = 1
		end
	end
end
