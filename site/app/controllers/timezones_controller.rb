class TimezonesController < AccountsController
	respond_to :json

	def show
		respond_with do |format|
			format.json {
				tz = ActiveSupport::TimeZone.new(current_user.timezone)
				render :layout => false, :text => {:timezone => current_user.timezone, :offset => tz.utc_offset()}.to_json()
			}
		end
	end

	def create
		respond_with do |format|
			format.json {
				current_user.update_attributes(:timezone => params[:timezone])
				tz = ActiveSupport::TimeZone.new(current_user.timezone)
				render :layout => false, :text => {:timezone => current_user.timezone, :offset => tz.utc_offset()}.to_json()
			}
		end
	end
end
