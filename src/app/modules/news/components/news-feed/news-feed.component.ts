import { Component, OnInit } from '@angular/core';
import { NewsService } from '../services/news.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-news-feed',
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.css']
})
export class NewsFeedComponent implements OnInit {
  newPost = { title: '', description: '', image: '' };
  posts: any[] = [];
 selectedImages: File[] = [];
  mediaUrl = environment.mediaUrl;
  previewImageUrl: string | null = null;
   previewUrl: string | null = null;
   previewUrls: string[] = [];
   loading:boolean=false;
   selectedFiles: File[] = [];
   previewFiles: { url: string; type: 'image' | 'video' }[] = [];


  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.newsService.getPosts().subscribe(data => {
      this.posts = data;
      this.loading = false;
    });
  }
onFilesSelected(event: Event): void {
  console.log("onFilesSelected");
    const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const allowedImageTypes = ['image/jpeg', 'image/png'];
  const allowedVideoTypes = ['video/mp4', 'video/webm'];

  const maxImageSize = 2 * 1024 * 1024;    // 2MB
  const maxVideoSize = 50 * 1024 * 1024;   // 50MB

  Array.from(input.files).forEach((file) => {

    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      alert(`${file.name} format not supported.`);
      return;
    }

    if (isImage && file.size > maxImageSize) {
      alert(`${file.name} exceeds 2MB.`);
      return;
    }

    if (isVideo && file.size > maxVideoSize) {
      alert(`${file.name} exceeds 50MB.`);
      return;
    }

    this.selectedFiles.push(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.previewFiles.push({
        url: reader.result as string,
        type: isVideo ? 'video' : 'image'
      });
    };

    reader.readAsDataURL(file);
  });

  input.value = '';
}
removeFile(index: number): void {
  this.selectedFiles.splice(index, 1);
  this.previewFiles.splice(index, 1);
}
removeImage(index: number): void {
  this.selectedImages.splice(index, 1);
  this.previewUrls.splice(index, 1);
}
  createPost(): void {
    console.log("createPost");
     this.loading = true;
    const { title, description } = this.newPost;

    if (title.trim().length < 5) {
      Swal.fire('Title too short', 'Minimum 5 characters required.', 'warning');
       this.loading = false;
      return;
    }

    if (description.trim().length < 10) {
      Swal.fire('Description too short', 'Minimum 10 characters required.', 'warning');
       this.loading = false;
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    this.selectedFiles.forEach((image, index) => {
      formData.append('images', image); // El backend debe aceptar 'images'
    });

    this.newsService.createPost(formData).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire('Success', 'Post created successfully!', 'success');
        this.newPost = { title: '', description: '', image: '' };
        this.selectedImages = [];
        this.previewUrls = [];
        this.loadPosts?.(); // si usas loadPosts para refrescar el feed
      },
      error: () => {
        Swal.fire('Error', 'Something went wrong while creating the post.', 'error');
      }
    });
  }


 /* likePost(postId: number) {
    this.newsService.likePost(postId).subscribe(() => this.loadPosts());
  }*/


}
