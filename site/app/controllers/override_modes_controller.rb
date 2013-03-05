class OverrideModesController < AccountsController
	respond_to :json

	def show
		respond_with do |format|
			format.json {
				render :layout => false, :text => current_user.override_mode.to_json()
			}
		end
	end

	def create
		respond_with do |format|
			format.json {
				current_user.update_attributes(:override_mode => params[:override_mode].to_i)
				render :layout => false, :text => current_user.override_mode.to_json()
			}

			begin
				http = Curl.post('http://localhost:1539/update', {:email => current_user.email})
			rescue
			end
		end
	end
end
