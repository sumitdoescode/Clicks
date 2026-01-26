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
import { Spinner } from "./ui/spinner";
import axios from "axios";
import { toast } from "sonner";
import { UserSchema, type User } from "@/schemas/user.schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface IUser {
    name: string;
    username: string;
    bio?: string;
    image?: string; // image will be "url"
}

type ErrorType = {
    name?: string[];
    username?: string[];
    bio?: string[];
    image?: string[];
};

const UpdateProfile = ({ name, username, bio, image }: IUser) => {
    const [formData, setFormData] = useState<User>({
        name: name,
        username: username,
        bio: bio || "",
        image: undefined,
    });
    const [imageUrl, setImageUrl] = useState<string | undefined>(image ? image : undefined);
    const [errors, setErrors] = useState<ErrorType>({});
    const [loading, setLoading] = useState(false);

    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

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

    const updateProfile = async (data: User) => {
        // construct the form data
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("username", data.username);
        if (data.bio) {
            formData.append("bio", data.bio);
        }
        if (data.image) {
            formData.append("image", data.image);
        }

        try {
            setLoading(true);
            const { data } = await axios.put("/api/user", formData);
            if (!data.success) {
                throw new Error(data.message);
            }
            toast.success("Profile updated successfully");
            setPreview(null);
        } catch (error: any) {
            if (error?.response?.data?.errorType === "VALIDATION_ERROR") {
                // set the errors state
                return setErrors(error?.response?.data?.error);
            }
            toast.error(error?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // client side validation
        const result = UserSchema.safeParse(formData);
        if (!result.success) {
            console.log(flattenError(result.error).fieldErrors);
            setErrors(flattenError(result.error).fieldErrors);
            return;
        }

        // call the api
        updateProfile(result.data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FieldSet>
                <FieldSet>
                    <FieldLegend className="text-3xl">Update Profile</FieldLegend>
                    {/* <FieldDescription>This appears on invoices and emails.</FieldDescription> */}
                    <div className="flex flex-col sm:flex-row gap-5 items-center justify-between mt-4">
                        {/* drop zone */}

                        <Avatar className="w-50 h-50">
                            <AvatarImage src={imageUrl} className="rounded-lg" />
                            <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onClick={() => {
                                // click on div => click on input
                                document.getElementById("image")?.click();
                            }}
                            className={`flex items-center justify-center w-52 h-52 border-2 border-dashed rounded-lg cursor-pointer transition ${isDragging ? "border-primary bg-primary/10" : "border-muted"}`}
                        >
                            {preview ? (
                                <div className="flex items-center justify-center w-full h-full rounded-lg overflow-hidden">
                                    <Image src={preview} alt="post image" className="w-full h-full object-contain" width={500} height={200} />
                                </div>
                            ) : (
                                <div className="flex items-center flex-col text-center px-4">
                                    <p className="text-muted-foreground">Drag & drop image here or click to upload</p>
                                    <Button className="mx-auto mt-2" type="button">
                                        <Upload /> Upload
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {errors?.image && errors.image.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}

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

                    <FieldGroup className="mt-2">
                        <Field>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                aria-invalid={errors?.name?.length > 0}
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    setErrors({ ...errors, name: undefined });
                                }}
                            />
                            {errors?.name && errors.name.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}
                        </Field>

                        {/* username */}
                        <Field>
                            <FieldLabel htmlFor="username">Username</FieldLabel>
                            <Input
                                id="username"
                                placeholder="johndoe"
                                aria-invalid={errors?.username?.length > 0}
                                value={formData.username}
                                onChange={(e) => {
                                    setFormData({ ...formData, username: e.target.value });
                                    setErrors({ ...errors, username: undefined });
                                }}
                            />
                            <FieldDescription>Your username is public</FieldDescription>
                            {errors?.username && errors.username.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}
                        </Field>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                                <Textarea
                                    id="bio"
                                    placeholder="Write something about yourself here.."
                                    aria-invalid={errors?.bio?.length > 0}
                                    rows={5}
                                    value={formData.bio}
                                    onChange={(e) => {
                                        setFormData({ ...formData, bio: e.target.value });
                                        setErrors({ ...errors, bio: undefined });
                                    }}
                                />
                                {errors?.bio && errors.bio.map((error: string, index: number) => <FieldError key={index}>{error}</FieldError>)}
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </FieldSet>

                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner />
                            Updating
                        </>
                    ) : (
                        "Update"
                    )}
                </Button>
            </FieldSet>
        </form>
    );
};

export default UpdateProfile;
