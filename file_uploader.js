
	var file_upload_error = false;

	if (('undefined' === typeof(file_uploader_action_url)) || ('' == file_uploader_action_url)) {
		file_upload_error = true;
	}

	if (file_upload_error) {
		alert('No upload link.');
	}

	else {

		$(function(){
			$('.file_uploader').change(file_uploader_event);
		});

		var file_uploader_unique_ids = {};

		function file_uploader_delete_file(unique_filename_id) {
			$('#file_uploader_result_file_' + unique_filename_id).slideUp('fast', function(){
				$('#file_uploader_result_file_' + unique_filename_id).remove();
				if (typeof file_uploader_unique_ids[unique_filename_id] !== "undefined") {
					var file_for_deletion = file_uploader_unique_ids[unique_filename_id].delete_filename;
					$.ajax({
						'url': file_uploader_action_url + '?type=cancel&name=' + file_for_deletion,
						'type': 'get',
						'success': function(){}
					});
				}
			});
		}

		function file_uploader_event(event) {

			function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

			function loadstart_function(event, file, unique_filename_id, result_box) {
				var new_filebox = '\
					<div id="file_uploader_result_file_' + unique_filename_id + '" class="file_uploader_result_box">\
					<div class="file_uploader_result_status" title="Uploading"></div>\
					<span class="file_uploader_result_delete" onClick="file_uploader_delete_file(\'' + unique_filename_id + '\');"></span>\
					<span class="file_uploader_result_name">' + file.name + '</span>\
					<span class="file_uploader_result_percentbar"><em></em></span>\
					</div>\
					';
				result_box.append(new_filebox);
			}

			function create_error_box(file, unique_filename_id, result_box) {
				var new_filebox = '\
					<div id="file_uploader_result_file_' + unique_filename_id + '" class="file_uploader_result_box">\
					<div class="file_uploader_result_status error" title="File is too big (' + formatBytes(file.size) + ')"></div>\
					<span class="file_uploader_result_delete" onClick="file_uploader_delete_file(\'' + unique_filename_id + '\');"></span>\
					<span class="file_uploader_result_name">' + file.name + '</span>\
					</div>\
					';
				result_box.append(new_filebox);
			}

			function loadstart_listener(event, file, unique_filename_id, result_box) {
				return function(){
					loadstart_function(event, file, unique_filename_id, result_box);
				};
			};

			var container_result_id = $(event.target).data('container_result_id');

			var result_box = $('#' + container_result_id);

			var files = event.target.files;

			for (var i = 0; i < files.length; i++) {

				var file = files[i];

				var unique_filename_id = "xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
					var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
					return v.toString(16);
				});

				if (10240000 <= file.size) {
					create_error_box(file, unique_filename_id, result_box);
					continue;
				}

				file_uploader_unique_ids[unique_filename_id] = new XMLHttpRequest();
				file_uploader_unique_ids[unique_filename_id].unique_filename_id = unique_filename_id;

				var data = new FormData();
				data.append('Filedata', file, file.name);

				file_uploader_unique_ids[unique_filename_id].addEventListener('loadstart', loadstart_listener(event, file, unique_filename_id, result_box));

				(function(unique_filename_id){

					file_uploader_unique_ids[unique_filename_id].upload.onprogress = function(event){
						if (event.lengthComputable) {
							var percentComplete = Math.round((event.loaded / event.total) * 100);
							$('#file_uploader_result_file_' + unique_filename_id + ' .file_uploader_result_percentbar em').css({'width': percentComplete + '%'});
						}
					};

					file_uploader_unique_ids[unique_filename_id].onreadystatechange = function(event){
						if (4 == this.readyState && '' != this.responseText) {
							if (200 === this.status) {
								if (this.responseText) {
									json = JSON.parse(this.responseText);
									file_uploader_unique_ids[unique_filename_id].delete_filename = json.server;
									var hidden_inputs		= '\
										<input type="hidden" name="file_client[]" value="' + json.client + '" />\
										<input type="hidden" name="file_server[]" value="' + json.server + '" />\
										<input type="hidden" name="file_size[]" value="' + json.size + '" />\
										';
									$('#file_uploader_result_file_' + this.unique_filename_id).append(hidden_inputs);
									$('#file_uploader_result_file_' + this.unique_filename_id + ' .file_uploader_result_status').removeClass('error').addClass('success').attr('title', 'File was uploaded successfully.');
								}
							}
							if (413 == this.status) {
								$('#file_uploader_result_file_' + this.unique_filename_id + ' .file_uploader_result_status').removeClass('success').addClass('error').attr('title', 'File is too big.');
							}
						}
					};

				}(unique_filename_id));

				file_uploader_unique_ids[unique_filename_id].open('POST', file_uploader_action_url, true);
				file_uploader_unique_ids[unique_filename_id].send(data);

			}

			$(event.target).val('');

		}

	}
