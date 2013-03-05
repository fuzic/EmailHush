class NamesController < AccountsController
	respond_to :json

	def show
		respond_with do |format|
			format.json {
				render :layout => false, :text => current_user.name.to_json()
			}
		end
	end

	def create
		respond_with do |format|
			format.json {
				current_user.update_attributes(:name => params[:name])
				render :layout => false, :text => current_user.name.to_json()
			}
		end
	end
end
