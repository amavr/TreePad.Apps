/*
Copyright 2012 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Eric Bidelman (ericbidelman@chromium.org)
*/

"use strict";


function GDocs(selector) {

    var SCOPE_ = 'https://www.googleapis.com/drive/v2/';
    var CONTENT_ = 'https://content.googleapis.com/drive/v2/';
    var KEY_ = 'AIzaSyAAdwcBLfjclphcokapqnSEEp2PX6Y6la0';
    var HOME_ = 'TreePad';

    var me = this;

    this.lastResponse = null;

    this.accessToken = null;
    
    this.home_folder_id = null;

    this.__defineGetter__('SCOPE', function () {
        return SCOPE_;
    });

    this.__defineGetter__('CONTENT', function () {
        return CONTENT_;
    });

    this.__defineGetter__('KEY', function () {
        return KEY_;
    });

    this.__defineGetter__('HOME', function () {
        return HOME_;
    });

    this.__defineGetter__('DOCLIST_FEED', function () {
        return SCOPE_ + 'files';
    });

    this.__defineGetter__('CREATE_SESSION_URI', function () {
        return 'https://www.googleapis.com/upload/drive/v2/files?uploadType=resumable';
    });

    this.__defineGetter__('DEFAULT_CHUNK_SIZE', function () {
        return 1024 * 1024 * 5; // 5MB;
    });


    
    var pack_error = function(err_message){
        return [{"title":"Error", "text": err_message, "children":[]}];        
    }
    
    var auth2 = function (interactive, callback) {
        chrome.identity.getAuthToken({ 'interactive': interactive }, function (token) {
            if (token) {
                me.accessToken = token;
                callback && callback();
            }
            else {
                if (!interactive) {
                    auth2(true, callback);
                }
            }
        });
    }

    this.auth = function (callback) {
        try {
            auth2(false, callback);
        } catch (e) {
            console.log(e);
            auth2(true, callback);
        }
    }

    this.removeCachedAuthToken = function (opt_callback) {
        if (me.accessToken) {
            var accessToken = me.accessToken;
            me.accessToken = null;
            // Remove token from the token cache.
            chrome.identity.removeCachedAuthToken({
                token: accessToken
            }, function () {
                opt_callback && opt_callback();
            });
        } else {
            opt_callback && opt_callback();
        }
    };

    this.revokeAuthToken = function (opt_callback) {
        if (me.accessToken) {
            // Make a request to revoke token
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' +
                me.accessToken);
            xhr.send();
            me.removeCachedAuthToken(opt_callback);
        }
    }

    /*
     * Generic HTTP AJAX request handler.
     */
    this.makeRequest = function (method, url, callback, opt_data, opt_headers) {

        var data = opt_data || null;
        var headers = opt_headers || {};

        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        // Include common headers (auth and version) and add rest. 
        xhr.setRequestHeader('Authorization', 'Bearer ' + me.accessToken);
        for (var key in headers) {
            console.log('[' + key + ']=[' + headers[key] + ']');
            xhr.setRequestHeader(key, headers[key]);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    try
                    {
                        var answer = JSON.parse(xhr.responseText);
                        console.log(answer);
                        callback(answer);
                    }
                    catch(ex)
                    {
                        console.log(ex.message);
                        callback(pack_error(ex.message));
                    }
                }
            }
        };

        xhr.onerror = function (e) {
            console.log(me, me.status, me.response,
                me.getAllResponseHeaders());
        };

        xhr.send(data);
    };


    // calback = function(string folder_id)
    this.getRootFolder = function (callback) {
        me.makeRequest('GET', me.SCOPE + 'about', function (answer) {
            callback(answer.rootFolderId);
        });
    }

    // calback = function(string folder_id)
    this.getHomeFolder = function (root_id, callback) {
        var q = encodeURIComponent('mimeType contains "application/vnd.google-apps.folder" and title = "' + me.HOME + '" and trashed = false and "' + root_id + '" in parents');
        var f = encodeURIComponent('items(id,originalFilename,mimeType,modifiedDate,kind,title)');

        me.makeRequest('GET', me.SCOPE + 'files?q=' + q + '&fields=' + f, function (answer) {
            if (answer.items.length == 0) {
                callback(null);
                me.home_folder_id = null;
            }
            else {
                me.home_folder_id = answer.items[0].id; 
                callback(me.home_folder_id);
            }
        });
    }

    // callback = function(folder_id)
    this.createHomeFolder = function (root_id, callback) {

        var data = {
            "title": me.HOME,
            "parents":
            [
                {
                    "id": root_id
                }
            ],
            "mimeType": "application/vnd.google-apps.folder"
        };

        var json = JSON.stringify(data);

        var headers = {
            "Content-Type": "application/json"
        };
    
        // var url = 'https://www.googleapis.com/drive/v2/files?uploadType=media HTTP/1.1';
        var url = me.SCOPE + 'files?uploadType=media HTTP/1.1';

        me.makeRequest('POST', 
            url, 
            function (answer) {
                me.home_folder_id = answer.id;
                callback(answer.id);
            },
            json,
            headers);

    }

    // calback = function(files)
    this.getFiles = function (folder_id, callback) {

        var q = encodeURIComponent('mimeType = "application/json" and trashed = false and "' + folder_id + '" in parents');
        var f = encodeURIComponent('items(id,mimeType,fileExtension,downloadUrl,webViewLink,webContentLink,defaultOpenWithLink,selfLink,kind,fileSize,modifiedDate,title)');

        me.makeRequest('GET', me.SCOPE + 'files?q=' + q + '&fields=' + f, function (answer) {
            if (answer.items.length == 0) {
                callback(null);
            }
            else {
                callback(answer.items);
            }
        });
    }

    // callback = function(title, fileData)
    this.loadFile = function (file_id, callback) {

        var f = encodeURIComponent('downloadUrl,title');

        me.makeRequest('GET', me.SCOPE + 'files/' + file_id + '?fields=' + f, function (answer) {

            if (answer) {
                var title = answer.title;
                
                me.makeRequest('GET', answer.downloadUrl, function (data) {
                    callback(title, data);
                });
            }
            else {
                callback(null, null);
            }

        });
    }

    this.uploadFile = function (fileData, title, id, callback) {

        var boundary = '-------314159265358979323846';
        var delimiter = "\r\n--" + boundary + "\r\n";
        var close_delim = "\r\n--" + boundary + "--";

        var reader = new FileReader();
        reader.readAsBinaryString(fileData);
        reader.onload = function (e) {
            var contentType = fileData.type || 'application/octet-stream';
            var metadata = {
                'title': title,
                'mimeType': contentType,
                'parents': [
                    { 'id': me.home_folder_id }
                ],
            };

            var base64Data = btoa(reader.result);
            var multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                base64Data +
                close_delim;

            var rest_id = (id === null) ? '' : '/' + id;
            var method = (id === null) ? 'POST' : 'PUT';

            me.makeRequest(
                method,
                'https://www.googleapis.com/upload/drive/v2/files' + rest_id + '?uploadType=multipart',
                function(answer){
                    callback && callback(answer);
                },
                multipartRequestBody,
                { 'Content-Type': 'multipart/mixed; boundary="' + boundary + '"' }
                );
        };
    };
};





var obj2str = function (obj) {
    if (obj) {
        var str = Object.keys(obj).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
        }).join('&');
        return '?' + str;
    }
    else {
        return '';
    }
}
     