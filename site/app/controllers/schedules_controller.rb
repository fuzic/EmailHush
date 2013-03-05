class SchedulesController < AccountsController
	respond_to :json

	def show
		respond_with do |format|
			format.json {
				render :layout => false, :text => current_user.calendar_cache.to_json()
			}
		end
	end
end
