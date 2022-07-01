function readURL(input, num) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $(`#image-upload-wrap${num}`).hide();

      $(`#file-upload-image${num}`).attr("src", e.target.result);
      $(`#file-upload-content${num}`).show();

      $(`#image-title${num}`).html(input.files[0].name);
    };

    reader.readAsDataURL(input.files[0]);
  } else {
    removeUpload();
  }
}

function removeUpload(num) {
  console.log(num);
  if ($(`#removeImgBtn${num}`)[0].dataset.type === "edit") {
    console.log($(`#removeImgBtn${num}`)[0].dataset.imgurl);
    deleteImgList[num] = $(`#removeImgBtn${num}`)[0].dataset.imgurl;
  } else {
    console.log(false);
  }

  $(`#file-upload-input${num}`).replaceWith(
    $(`#file-upload-input${num}`).clone()
  );
  $(`#image-upload-wrap${num}`).removeClass("image-dropping");
  $(`#file-upload-image${num}`).removeAttr("src");
  $(`#file-upload-input${num}`).val("");
  $(`#file-upload-content${num}`).hide();
  $(`#image-upload-wrap${num}`).show();
}
$(`#image-upload-wrap0`).bind("dragover", function () {
  $(`#image-upload-wrap0`).addClass("image-dropping");
});
$(`#image-upload-wrap0`).bind("dragleave", function () {
  $(`#image-upload-wrap0`).removeClass("image-dropping");
});

$(`#image-upload-wrap1`).bind("dragover", function () {
  $(`#image-upload-wrap1`).addClass("image-dropping");
});
$(`#image-upload-wrap1`).bind("dragleave", function () {
  $(`#image-upload-wrap1`).removeClass("image-dropping");
});

$(`#image-upload-wrap2`).bind("dragover", function () {
  $(`#image-upload-wrap2`).addClass("image-dropping");
});
$(`#image-upload-wrap2`).bind("dragleave", function () {
  $(`#image-upload-wrap2`).removeClass("image-dropping");
});

// function readURL(input) {
//   if (input.files && input.files[0]) {
//     var reader = new FileReader();

//     reader.onload = function (e) {
//       $(".image-upload-wrap").hide();

//       $(".file-upload-image").attr("src", e.target.result);
//       $(".file-upload-content").show();

//       $(".image-title").html(input.files[0].name);
//     };

//     reader.readAsDataURL(input.files[0]);
//   } else {
//     removeUpload();
//   }
// }

// function removeUpload() {
//   $(".file-upload-input").replaceWith($(".file-upload-input").clone());
//   $(".image-upload-wrap").removeClass("image-dropping");
//   $(".file-upload-image").removeAttr("src");
//   $(".file-upload-input").val("");
//   $(".file-upload-content").hide();
//   $(".image-upload-wrap").show();
// }
// $(".image-upload-wrap").bind("dragover", function () {
//   $(".image-upload-wrap").addClass("image-dropping");
// });
// $(".image-upload-wrap").bind("dragleave", function () {
//   $(".image-upload-wrap").removeClass("image-dropping");
// });

// function readURL(input) {
//   if (input.files && input.files[0]) {
//     var reader = new FileReader();

//     reader.onload = function (e) {
//       $("#image-upload-wrap0").hide();

//       $("#file-upload-image0").attr("src", e.target.result);
//       $("#file-upload-content0").show();

//       $("#image-title0").html(input.files[0].name);
//     };

//     reader.readAsDataURL(input.files[0]);
//   } else {
//     removeUpload();
//   }
// }

// function removeUpload() {
//   $("#file-upload-input0").replaceWith($("#file-upload-input0").clone());
//   $("#image-upload-wrap0").removeClass("image-dropping");
//   $("#file-upload-image0").removeAttr("src");
//   $("#file-upload-input0").val("");
//   $("#file-upload-content0").hide();
//   $("#image-upload-wrap0").show();
//   console.log($("#file-upload-input0")[0].files.lemgth);
//   console.log($("#file-upload-input0")[0].files[0]);
// }
// $("#image-upload-wrap0").bind("dragover", function () {
//   $("#image-upload-wrap0").addClass("image-dropping");
// });
// $("#image-upload-wrap0").bind("dragleave", function () {
//   $("#image-upload-wrap0").removeClass("image-dropping");
// });
