class StatesController < AccountsController
	respond_to :json

	def show
		respond_with do |format|
			format.json {
				render :layout => false, :text => current_user.state.to_json()
			}
		end
	end

	def create
		respond_with do |format|
			format.json {
				state = [current_user.state, params[:state].to_i].max
				current_user.update_attributes(:state => state)
				render :layout => false, :text => current_user.state.to_json()
			}
		end
	end
end
