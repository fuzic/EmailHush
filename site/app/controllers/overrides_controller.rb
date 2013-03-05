class OverridesController < AccountsController
	respond_to :json

	def show
		respond_with do |format|
			format.json {
				render :layout => false, :text => current_user.override.to_json()
			}
		end
	end

	def create
		respond_with do |format|
			format.json {
				current_user.update_attributes(:override => params[:override].to_i)
				current_user.update_attributes(:override_mode => 0)
				render :layout => false, :text => current_user.override.to_json()
			}

			begin
				http = Curl.post('http://localhost:1539/update', {:email => current_user.email})
			rescue
			end
		end
	end
end
