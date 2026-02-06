"use client";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { PostSchema, type Post } from "@/schemas/post.schema";
import { Upload } from "lucide-react";
import Image from "next/image";
import { flattenError } from "zod";
import { Spinner } from "../ui/spinner";
import axios from "axios";
import { toast } from "sonner";

type PostForm = {
    caption: string;
    image: File | null;
};

type ErrorType = {
    caption?: string[];
    image?: string[];
};

const CreatePost = () => {
    const [formData, setFormData] = useState<PostForm>({
        caption: "",
        image: null,
    });

    const [errors, setErrors] = useState<ErrorType>({});

    const [loading, setLoading] = useState(false);

    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!formData.image) {
            setPreview(null);
            return;
        }
        // creating a new object url for the image
        const objectURL = URL.createObjectURL(formData.image);
        setPreview(objectURL);

        // revoke the object url to free up memory
        // whenever formData.image changes +> first => revokeObjectURL (previous object url) => then => createObjectURL (new object url)
        return () => {
            URL.revokeObjectURL(objectURL);
        };
    }, [formData.image]);

    // drag handlers
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEnter = () => setIsDragging(true);
    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setErrors({ ...errors, image: undefined });
        }
    };

    const createPost = async () => {
        try {
            setLoading(true);

            // construct the form data
            const newFormData = new FormData();
            newFormData.append("caption", formData.caption);
            newFormData.append("image", formData.image!);

            const { data } = await axios.post("/api/post", newFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (!data.success) {
                throw new Error(data.message);
            }
            toast.success("Post created successfully");
        } catch (error: any) {
            if (error.response.data.errorType === "VALIDATION_ERROR") {
                // set the errors state
                return setErrors(error.response.data.error);
            }
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // client side validation
        const result = PostSchema.safeParse(formData);
        if (!result.success) {
            console.log(flattenError(result.error).fieldErrors);
            setErrors(flattenError(result.error).fieldErrors);
            return;
        }

        // call the api
        createPost();
    };

    return (
        <form onSubmit={handleSubmit}>
            <FieldSet>
                {/* drop zone */}

                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onClick={() => {
                        // click on input
                        document.getElementById("image")?.click();
                    }}
                    className={`flex items-center justify-center w-full h-96 border-2 border-dashed rounded-lg cursor-pointer transition ${isDragging ? "border-primary bg-primary/10" : "border-muted"}`}
                >
                    {preview ? (
                        <div className="flex items-center justify-center w-full h-full rounded-lg overflow-hidden">
                            <Image src={preview} alt="post image" className="w-full h-full object-contain" width={500} height={500} />
                        </div>
                    ) : (
                        <div className="flex items-center flex-col">
                            <p className="text-muted-foreground">Drag & drop image here or click to upload</p>
                            <Button className="mx-auto mt-2" type="button">
                                <Upload /> Upload
                            </Button>
                        </div>
                    )}
                </div>
                {errors?.image && <FieldError>{errors.image}</FieldError>}

                {/* hidden image input */}
                <Field className="hidden">
                    <FieldLabel htmlFor="image">Image</FieldLabel>
                    <Input
                        type="file"
                        accept="image/*"
                        id="image"
                        autoComplete="off"
                        onChange={(e: any) => {
                            setFormData({ ...formData, image: e.target.files[0] });
                            setErrors({ ...errors, image: undefined });
                        }}
                    />
                </Field>

                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="caption">Caption</FieldLabel>
                        <Textarea
                            id="caption"
                            autoComplete="off"
                            placeholder="Write something about post here.."
                            rows={5}
                            value={formData.caption}
                            onChange={(e) => {
                                setErrors({ ...errors, caption: undefined });
                                setFormData({ ...formData, caption: e.target.value });
                            }}
                        />
                        {errors?.caption && <FieldError>{errors.caption}</FieldError>}
                    </Field>
                </FieldGroup>

                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner />
                            Submitting
                        </>
                    ) : (
                        "Submit"
                    )}
                </Button>
            </FieldSet>
        </form>
    );
};

export default CreatePost;
