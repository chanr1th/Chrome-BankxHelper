'use strict';

let appEnable = document.getElementById('checkbox-app-enable');
appEnable.onchange = () => chrome.storage.sync.set({"appEnable": !!event.target.checked});

let showDock = document.getElementById('checkbox-show-dock');
showDock.onchange = () => chrome.storage.sync.set({"showDock": !!event.target.checked});

let darkMode = document.getElementById('checkbox-dark-mode');
darkMode.onchange = () => chrome.storage.sync.set({"darkMode": !!event.target.checked});

let checkboxAutomation = document.getElementById('checkbox-automation');
let detailsAutomation = document.getElementById('details-automation');
checkboxAutomation.onchange = function() {
    chrome.storage.sync.set({"automation": !!event.target.checked});
    detailsAutomation.classList.toggle('disabled', !event.target.checked);
}
let checkboxAutoComplete = document.getElementById('checkbox-auto-complete');
let checkboxAutoSubmit = document.getElementById('checkbox-auto-submit');
checkboxAutoComplete.onchange = function() {
    chrome.storage.sync.set({"autoComplete": !!event.target.checked});
    checkboxAutoSubmit.toggleAttribute('disabled', !event.target.checked);
}
checkboxAutoSubmit.onchange = () => chrome.storage.sync.set({"autoSubmit": !!event.target.checked});


chrome.storage.sync.get(null, function(items) {
    for (let key in items) {
        let value = items[key];
        switch(key) {
            case 'appEnable':
                appEnable.checked = value;
                showDock.disabled = !value;
                darkMode.disabled = !value;
                checkboxAutomation.disabled = !value;
                detailsAutomation.classList.toggle('disabled', !value);
                break;
            case 'showDock':
                showDock.checked = value;
                break;
            case 'darkMode':
                darkMode.checked = value;
                break;
            case 'automation':
                checkboxAutomation.checked = value;
                break;
            case 'autoComplete':
                checkboxAutoComplete.checked = value;
                checkboxAutoSubmit.toggleAttribute('disabled', !value);
                break;
            case 'autoSubmit':
                checkboxAutoSubmit.checked = value;
                break;
        }
    }
});

// let createBookmark = document.getElementById('create-bookmark');
// createBookmark.onclick = function() {
//  // chrome.bookmarks.create({'parentId': bookmarkBar.id, 'title': 'Extension bookmarks'}, function(newFolder) {
//  //  console.log("added folder: " + newFolder.title);
//  // });
//  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {console.log(bookmarkTreeNodes);});
// }

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        let newValue = changes[key].newValue;
        switch(key) {
            case 'appEnable':
                showDock.disabled = !newValue;
                darkMode.disabled = !newValue;
                checkboxAutomation.disabled = !newValue;
                detailsAutomation.classList.toggle('disabled', !newValue);
                break;
        }
    }
});

///////////////////////////////test

// $(function() {
//   $('#search').change(function() {
//      $('#bookmarks').empty();
//      dumpBookmarks($('#search').val());
//   });
// });
// // Traverse the bookmark tree, and print the folder and nodes.
// function dumpBookmarks(query) {
//   var bookmarkTreeNodes = chrome.bookmarks.getTree(
//     function(bookmarkTreeNodes) {
//       $('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes, query));
//     });
// }
// function dumpTreeNodes(bookmarkNodes, query) {
//   var list = $('<ul>');
//   var i;
//   for (i = 0; i < bookmarkNodes.length; i++) {
//     list.append(dumpNode(bookmarkNodes[i], query));
//   }
//   return list;
// }
// function dumpNode(bookmarkNode, query) {
//   if (bookmarkNode.title) {
//     if (query && !bookmarkNode.children) {
//       if (String(bookmarkNode.title).indexOf(query) == -1) {
//         return $('<span></span>');
//       }
//     }
//     var anchor = $('<a>');
//     anchor.attr('href', bookmarkNode.url);
//     anchor.text(bookmarkNode.title);
//     /*
//      * When clicking on a bookmark in the extension, a new tab is fired with
//      * the bookmark url.
//      */
//     anchor.click(function() {
//       chrome.tabs.create({url: bookmarkNode.url});
//     });
//     var span = $('<span>');
//     var options = bookmarkNode.children ?
//       $('<span>[<a href="#" id="addlink">Add</a>]</span>') :
//       $('<span>[<a id="editlink" href="#">Edit</a> <a id="deletelink" ' +
//         'href="#">Delete</a>]</span>');
//     var edit = bookmarkNode.children ? $('<table><tr><td>Name</td><td>' +
//       '<input id="title"></td></tr><tr><td>URL</td><td><input id="url">' +
//       '</td></tr></table>') : $('<input>');
//     // Show add and edit links when hover over.
//         span.hover(function() {
//         span.append(options);
//         $('#deletelink').click(function() {
//           $('#deletedialog').empty().dialog({
//                  autoOpen: false,
//                  title: 'Confirm Deletion',
//                  resizable: false,
//                  height: 140,
//                  modal: true,
//                  overlay: {
//                    backgroundColor: '#000',
//                    opacity: 0.5
//                  },
//                  buttons: {
//                    'Yes, Delete It!': function() {
//                       chrome.bookmarks.remove(String(bookmarkNode.id));
//                       span.parent().remove();
//                       $(this).dialog('destroy');
//                     },
//                     Cancel: function() {
//                       $(this).dialog('destroy');
//                     }
//                  }
//                }).dialog('open');
//          });
//         $('#addlink').click(function() {
//           $('#adddialog').empty().append(edit).dialog({autoOpen: false,
//             closeOnEscape: true, title: 'Add New Bookmark', modal: true,
//             buttons: {
//             'Add' : function() {
//                chrome.bookmarks.create({parentId: bookmarkNode.id,
//                  title: $('#title').val(), url: $('#url').val()});
//                $('#bookmarks').empty();
//                $(this).dialog('destroy');
//                window.dumpBookmarks();
//              },
//             'Cancel': function() {
//                $(this).dialog('destroy');
//             }
//           }}).dialog('open');
//         });
//         $('#editlink').click(function() {
//          edit.val(anchor.text());
//          $('#editdialog').empty().append(edit).dialog({autoOpen: false,
//            closeOnEscape: true, title: 'Edit Title', modal: true,
//            show: 'slide', buttons: {
//               'Save': function() {
//                  chrome.bookmarks.update(String(bookmarkNode.id), {
//                    title: edit.val()
//                  });
//                  anchor.text(edit.val());
//                  options.show();
//                  $(this).dialog('destroy');
//               },
//              'Cancel': function() {
//                  $(this).dialog('destroy');
//              }
//          }}).dialog('open');
//         });
//         options.fadeIn();
//       },
//       // unhover
//       function() {
//         options.remove();
//       }).append(anchor);
//   }
//   var li = $(bookmarkNode.title ? '<li>' : '<div>').append(span);
//   if (bookmarkNode.children && bookmarkNode.children.length > 0) {
//     li.append(dumpTreeNodes(bookmarkNode.children, query));
//   }
//   return li;
// }

// document.addEventListener('DOMContentLoaded', function () {
//   dumpBookmarks();
// });